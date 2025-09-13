"use client";

import { useState } from "react";
import {
  BadgeCheck,
  LogInIcon,
  SearchCheckIcon,
  User,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "./AuthModal"; // Adjust the import path as needed
// REMOVED: import { createUser } from "../_lib/auth"; // This import was causing the error
import { useSession } from "next-auth/react";
import SearchBar from "./SearchBar";
import { useTheme } from "../provider";

export default function Navigation() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  const handleNavigation = (url) => {
    console.log("Navigating to:", url);
    router.push(url);
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    // Close mobile menu when opening auth modal
    setIsMobileMenuOpen(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-6 bg-white dark:bg-gray-900 shadow-sm">
        {/* Logo */}
        <div className="flex items-center ml-[-6px]">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold flex items-center"
          >
            <img
              src="/icon.png"
              alt="Logo"
              className="inline-block w-6 h-6 sm:w-8 sm:h-8 mr-2"
            />
            <span className="hidden sm:inline">Fleek Reporter</span>
          </Link>
        </div>

        {/* Desktop Navigation Links or Search - Hidden on mobile and tablet */}
        <div className="hidden lg:flex  space-x-6 text-black dark:text-gray-200">
          {session && session.user ? (
            <SearchBar
              placeholder="Search reports..."
              debounceMs={300}
              className=""
              inputProps={{
                className:
                  "w-[300px] rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm py-2 pr-9 pl-9 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent",
              }}
              onSearch={(q) => {
                // Only navigate if there's actually a search query
                if (!q || q.trim() === '') {
                  return;
                }
                
                // Only navigate to feeds if we're not already on a feeds page
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/feeds')) {
                  router.push(`/account/feeds?q=${encodeURIComponent(q)}`);
                } else {
                  // If already on feeds page, just update the URL without navigation
                  const url = new URL(window.location);
                  url.searchParams.set('q', q);
                  window.history.replaceState({}, '', url);
                }
              }}
            />
          ) : (
            <>
              <Link
                href="/works"
                className="hover:text-blue-700 hover:font-bold cursor-pointer transition-colors flex items-center"
              >
                <BadgeCheck className="inline mr-1 w-4 h-4" />
                How It Works
              </Link>

              <Link
                href="/faq"
                className="hover:text-blue-700 hover:font-bold cursor-pointer transition-colors flex items-center"
              >
                <SearchCheckIcon className="inline mr-1 w-4 h-4" />
                FAQ
              </Link>
            </>
          )}
        </div>

        {/* Desktop Get Started Button - Hidden on mobile and tablet */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <span className="sr-only">Toggle theme</span>
            <Sun className="w-5 h-5 hidden dark:block" />
            <Moon className="w-5 h-5 dark:hidden" />
          </button>
          {session && session.user ? (
            <img
              src={session.user.image || "/icon.png"}
              alt={session.user.name || "User"}
              className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover cursor-pointer"
              onClick={() => router.push("/account")}
              title={session.user.name || "Account"}
            />
          ) : (
            <button
              onClick={openAuthModal}
              className="px-4 xl:px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-600 transition-colors flex items-center text-sm xl:text-base"
            >
              <User className="inline mr-1 w-5 h-5" />
              Get Started
            </button>
          )}
        </div>

        {/* Mobile/Tablet Menu Button and Get Started */}
        <div className="lg:hidden flex items-center space-x-2">
          {/* Theme Toggle (mobile) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <Sun className="w-5 h-5 hidden dark:block" />
            <Moon className="w-5 h-5 dark:hidden" />
          </button>
          {/* Mobile Get Started Button */}
          {session && session.user ? (
            <img
              src={session.user.image || "/icon.png"}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full border-2 border-gray-300 object-cover cursor-pointer"
              onClick={() => router.push("/account")}
              title={session.user.name || "Account"}
            />
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3 sm:px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-600 transition-colors text-xs sm:text-sm"
            >
              <User className="inline mr-1 w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Get Started</span>
            </button>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-700  hover:text-black transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>

        {/* Mobile/Tablet Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                className="lg:hidden fixed inset-0 backdrop-blur-sm bg-white/20 z-40"
                onClick={closeMobileMenu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Mobile Menu */}
              <motion.div
                className="lg:hidden fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                {/* Header with close button */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center">
                    <img src="/icon.png" alt="Logo" className="w-8 h-8 mr-2" />
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Fleek Reporter
                    </span>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links or Search (mobile menu content) */}
                <div className="flex-1 py-6 px-6 space-y-2">
                  {session && session.user ? (
                    <div className="pt-2">
                      <SearchBar
                        placeholder="Search reports..."
                        debounceMs={300}
                        className="w-full"
                        inputProps={{
                          className:
                            "w-full rounded-full border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-800 backdrop-blur-sm py-2 pr-9 pl-9 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 focus:border-transparent",
                        }}
                        onSearch={(q) => {
                          // Only navigate if there's actually a search query
                          if (!q || q.trim() === '') {
                            closeMobileMenu();
                            return;
                          }
                          
                          // Only navigate to feeds if we're not already on a feeds page
                          const currentPath = window.location.pathname;
                          if (!currentPath.includes('/feeds')) {
                            router.push(`/account/feeds?q=${encodeURIComponent(q)}`);
                          } else {
                            // If already on feeds page, just update the URL without navigation
                            const url = new URL(window.location);
                            url.searchParams.set('q', q);
                            window.history.replaceState({}, '', url);
                          }
                          // Close mobile menu after search
                          closeMobileMenu();
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Link
                          href="/works"
                          onClick={() => handleNavigation("/works")}
                          className="flex items-center text-gray-800 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-xl transition-colors group"
                        >
                          <BadgeCheck className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">How It Works</span>
                        </Link>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          href="/faq"
                          onClick={() => handleNavigation("/faq")}
                          className="flex items-center text-gray-800 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-xl transition-colors group"
                        >
                          <SearchCheckIcon className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">FAQ</span>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Get Started Button at Bottom */}
                <motion.div
                  className="p-6 border-t border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {session && session.user ? (
                    <img
                      src={session.user.image || "/icon.png"}
                      alt={session.user.name || "User"}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover cursor-pointer mx-auto"
                      onClick={() => router.push("/account")}
                      title={session.user.name || "Account"}
                    />
                  ) : (
                    <button
                      onClick={openAuthModal}
                      className="w-full px-6 py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      <User className="mr-2 lg:w-7 lg:h-7  w-5 h-5" />
                      Get Started
                    </button>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}

