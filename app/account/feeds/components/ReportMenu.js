"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatData } from "../../chats/hooks/useChatData";
import { ensureProfileExists } from "../../../_lib/profileUtils";

const ReportMenu = ({
  show,
  setShow,
  report,
  triggerRef,
  isOwnReport,
  session,
}) => {
  const menuRef = useRef(null);
  const router = useRouter();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const { getOrCreateConversation } = useChatData(session);

  // Positioning logic (unchanged)
  useEffect(() => {
    if (show && triggerRef.current && menuRef.current) {
      const computeAndSetPosition = () => {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const offsetParent = menuRef.current.offsetParent;
        const anchorRect =
          offsetParent && offsetParent instanceof Element
            ? offsetParent.getBoundingClientRect()
            : { top: 0, left: 0 };

        let top = triggerRect.bottom + 8;
        let left = triggerRect.right - menuRect.width;
        if (left < 8) left = triggerRect.left;
        if (top + menuRect.height > viewportHeight - 8) {
          top = triggerRect.top - menuRect.height - 8;
        }

        top = top - anchorRect.top;
        left = left - anchorRect.left;

        setPosition({ top, left });
      };

      computeAndSetPosition();
      window.addEventListener("resize", computeAndSetPosition, {
        passive: true,
      });
      window.addEventListener("scroll", computeAndSetPosition, {
        passive: true,
      });
      return () => {
        window.removeEventListener("resize", computeAndSetPosition);
        window.removeEventListener("scroll", computeAndSetPosition);
      };
    }
  }, [show, triggerRef]);

  // Close menu on outside click / escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener("pointerdown", handleClickOutside, true);
      const handleKey = (e) => {
        if (e.key === "Escape") setShow(false);
      };
      document.addEventListener("keydown", handleKey, true);
      return () => {
        document.removeEventListener("pointerdown", handleClickOutside, true);
        document.removeEventListener("keydown", handleKey, true);
      };
    }
  }, [show, setShow, triggerRef]);

  // ----------------------------
  // Start conversation & navigate
  // ----------------------------
  const handleMessageReporter = async () => {
    if (!session?.user?.id || !report?.user_id) return;

    try {
      // Ensure both users have profiles
      await ensureProfileExists(
        session.user.id,
        session.user.name,
        session.user.image
      );
      await ensureProfileExists(report.user_id, report.user_name, null);

      // Create or get conversation with reporter
      const conversation = await getOrCreateConversation(
        report.user_id,
        report.id
      );
      if (!conversation) throw new Error("Could not start conversation");

      // Navigate to chat page with conversation ID
      router.push(
        `/account/chats?conversation=${conversation.id}&reporter=${
          report.user_id
        }&report=${report.id}&name=${encodeURIComponent(
          report.user_name || "Anonymous"
        )}`
      );
      setShow(false);
    } catch (err) {
      console.error("Error starting conversation:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
        userId: session?.user?.id,
        reportUserId: report.user_id,
        reportId: report.id
      });
      alert(`Unable to start conversation at this time. Error: ${err.message}`);
    }
  };

  const handleViewProfile = () => {
    router.push(`/account/profile`);
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          zIndex: 1000,
        }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px]"
      >
        {isOwnReport ? (
          <motion.button
            whileHover={{ backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewProfile}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:text-gray-900 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">View Your Profile</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMessageReporter}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:text-gray-900 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Message Reporter</span>
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportMenu;
