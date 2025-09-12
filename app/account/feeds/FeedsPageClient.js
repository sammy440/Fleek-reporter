"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../_components/Sidebar";
import ReportItem from "./components/ReportItem";
import CategoryFilter from "./components/CategoryFilter";
import { useFeedsData } from "./hooks/FeedsDataHandler";

function FeedsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState("feeds");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = [
    "All",
    "Technology",
    "Politics",
    "Sports",
    "Entertainment",
    "Science",
    "Health",
    "Breaking News",
  ];

  const {
    reports,
    loading,
    currentUserProfile,
    fetchReports,
    handleLike,
    handleCommentSubmit,
  } = useFeedsData(session, selectedCategory);

  // Read search query from URL with safe fallback
  const q = searchParams?.get("q") || "";
  const normalizedQuery = q.trim().toLowerCase();

  const filteredReports = normalizedQuery
    ? reports.filter((r) => {
        const haystack = [
          r.title || "",
          r.content || "",
          r.category || "",
          r.user_name || "",
        ]
          .join(" \n ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : reports;

  // Authentication check - FIXED: Only redirect if user is on feeds page and not authenticated
  useEffect(() => {
    if (status === "loading") return;

    // Only redirect to home if no session AND we're actually on the feeds page
    if (!session && window.location.pathname === "/account/feeds") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Hamburger Menu */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30"></div>

      {/* Sidebar Component */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        session={session}
        router={router}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onItemClick={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40"
        >
          {/* Add any desktop header content here if needed */}
        </motion.div>

        {/* Content Container */}
        <div className="w-full max-w-none lg:max-w-2xl lg:mx-auto px-0 sm:px-4 lg:px-6 py-4 lg:py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4 lg:mb-6"
            >
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                reports={reports}
                loading={loading}
              />
            </motion.div>

            {/* Feed Content */}
            {loading ? (
              <div className="space-y-4">
                {/* Loading skeletons */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 animate-pulse mx-4 sm:mx-0"
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="h-32 sm:h-48 bg-gray-200 rounded-lg sm:rounded-xl mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg sm:rounded-xl p-8 sm:p-12 text-center border border-gray-200 mx-4 sm:mx-0"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No reports found
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  {selectedCategory === "All"
                    ? "There are no reports to show at the moment."
                    : `No reports available in the ${selectedCategory} category.`}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchReports}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Refresh Feed
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredReports.map((report, index) => (
                    <motion.div
                      key={`${report.id}-${selectedCategory}`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.4,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                      layout
                    >
                      <ReportItem
                        key={report.id}
                        report={report}
                        session={session}
                        currentUserProfile={currentUserProfile}
                        onLike={handleLike}
                        onCommentSubmit={handleCommentSubmit}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load More / Refresh */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reports.length * 0.05 + 0.3 }}
                  className="text-center py-6 sm:py-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchReports}
                    className="bg-gray-100 text-gray-700 px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-gray-200 transition-all font-medium border border-gray-200 hover:border-gray-300 text-sm sm:text-base"
                  >
                    <div className="flex dark:text-black items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span className=" dark:text-black">Refresh Feed</span>
                    </div>
                  </motion.button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Floating Action Button for New Report */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/account/reports")}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-gray-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all z-40"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

export default function FeedsPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    }>
      <FeedsContent />
    </Suspense>
  );
}