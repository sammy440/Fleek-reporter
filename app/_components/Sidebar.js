"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  User,
  Rss,
  ClipboardList,
  UserCircle,
  Menu,
  X,
  LogOutIcon,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = ({
  activeSection,
  setActiveSection,
  session,
  router,
  chatUnreadCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Close sidebar when screen size changes to large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarItems = [
    {
      id: "account",
      label: "Account",
      active: activeSection === "account",
      Icon: User,
    },
    {
      id: "feeds",
      label: "Feeds",
      active: activeSection === "feeds",
      Icon: Rss,
    },
    {
      id: "reports",
      label: "Your Reports",
      active: activeSection === "reports",
      Icon: ClipboardList,
    },
    {
      id: "profile",
      label: "Profile",
      active: activeSection === "profile",
      Icon: UserCircle,
    },
    {
      id: "chats",
      label: "Chats",
      active: activeSection === "chats",
      Icon: MessageCircle,
      unread: typeof chatUnreadCount === "number" ? chatUnreadCount : 0,
    },
  ];

  const handleNavigation = (itemId) => {
    setActiveSection(itemId);
    if (itemId === "account") {
      router.push("/account");
    } else {
      router.push(`/account/${itemId}`);
    }
    setIsOpen(false);
  };

  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    signOut({ callbackUrl: "/" });
  };

  const handleCancelSignOut = () => {
    setShowSignOutModal(false);
  };

  return (
    <>
      {/* Mobile/Tablet Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        type="button"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        onClick={() => setIsOpen((prev) => !prev)}
        className="lg:hidden fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-md bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 p-3  text-gray-700 hover:bg-white hover:shadow-xl transition-all"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5 dark:text-black" />
          )}
        </motion.div>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <>
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={handleCancelSignOut}
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                    className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
                  >
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </motion.div>
                </div>

                {/* Modal Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2"
                >
                  Sign Out
                </motion.h3>

                {/* Modal Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 dark:text-gray-300 text-center mb-6"
                >
                  Are you sure you want to sign out? You&apos;ll need to sign in
                  again to access your account.
                </motion.p>

                {/* Modal Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex gap-3"
                >
                  {/* Cancel Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelSignOut}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>

                  {/* Confirm Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmSignOut}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    Sign Out
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`w-64 bg-white dark:bg-gray-900 shadow-lg fixed left-0 top-0 h-full z-40 lg:z-30 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Header Section */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 lg:border-none">
          {/* Close button for mobile - only visible on small screens */}
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Menu
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* User Profile in Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            {session.user.image && (
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={session.user.image}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 border-4 border-gray-100 shadow-md"
              />
            )}
            <div className="lg:hidden">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate px-2">
                {session.user.email}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="px-4 sm:px-6 py-4 flex-1">
          <div className="space-y-1 sm:space-y-2">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item.id)}
                className={`w-full text-left px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.active
                    ? "bg-gray-100 dark:bg-gray-100 border-l-4 border-gray-600 shadow-sm sidebar-active-button"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <span className="flex items-center">
                  {item.Icon && (
                    <item.Icon
                      className={`mr-3 w-4 h-4 sm:w-5 sm:h-5 ${
                        item.active
                          ? "sidebar-active-icon"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                  )}
                  <span className="font-medium text-sm sm:text-base">
                    {item.label}
                  </span>
                  {/* Show unread badge for chats */}
                  {item.id === "chats" && item.unread > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-500 dark:text-white text-black">
                      {item.unread}
                    </span>
                  )}
                </span>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 sm:p-6 mt-auto border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOutClick}
            className="w-full bg-gray-800 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
          >
            <span className="inline-flex items-center justify-center sm:justify-start gap-4 w-full">
              <span className="ml-[50px]">Sign Out</span>
              <LogOutIcon className="w-5 h-5" />
            </span>
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
