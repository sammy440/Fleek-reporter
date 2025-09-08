"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../_components/Sidebar";
import {
  AccountContent,
  FeedsContent,
  ReportsContent,
  ProfileContent,
} from "./components/AccountSections";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("account");
  const hasInitialized = useRef(false);

  // Authentication check - separate from section setting
  useEffect(() => {
    if (status === "loading") return;

    // Only redirect if no session AND we're actually on the account page
    if (!session && pathname === "/account") {
      router.push("/");
      return;
    }
  }, [session, status, router, pathname]);

  // Set active section based on URL - only run once on mount
  useEffect(() => {
    if (hasInitialized.current) return;

    const path = window.location.pathname;
    if (path === "/account") {
      setActiveSection("account");
    } else if (path.includes("/feeds")) {
      setActiveSection("feeds");
    } else if (path.includes("/reports")) {
      setActiveSection("reports");
    } else if (path.includes("/profile")) {
      setActiveSection("profile");
    }

    hasInitialized.current = true;
  }, []); // Empty dependency array - only run once

  // Update active section when pathname changes (for proper navigation)
  useEffect(() => {
    if (!hasInitialized.current) return;

    if (pathname === "/account") {
      setActiveSection("account");
    } else if (pathname.includes("/feeds")) {
      setActiveSection("feeds");
    } else if (pathname.includes("/reports")) {
      setActiveSection("reports");
    } else if (pathname.includes("/profile")) {
      setActiveSection("profile");
    }
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-gray-400 mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-900 dark:text-gray-100">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "feeds":
        return <FeedsContent />;
      case "reports":
        return <ReportsContent />;
      case "profile":
        return <ProfileContent session={session} />;
      default:
        return <AccountContent session={session} router={router} />;
    }
  };

  const getPageTitle = () => {
    switch (activeSection) {
      case "feeds":
        return "News Feeds";
      case "reports":
        return "Post New Report";
      case "profile":
        return "Profile Settings";
      default:
        return "Account Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        session={session}
        router={router}
      />

      {/* Main Content - Responsive margins and padding */}
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-6xl mx-auto"
        >
          {/* Header - Responsive text sizing with dark mode support */}
          <div className="mb-6 lg:mb-8">
            <motion.h1
              key={activeSection}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {getPageTitle()}
            </motion.h1>
          </div>

          {/* Content Area with AnimatePresence for smooth transitions */}
          <AnimatePresence mode="wait">
            <div key={activeSection}>{renderContent()}</div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
