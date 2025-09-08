import { motion } from "framer-motion";
import { useMemo } from "react";

const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
  reports = [], // Add reports prop to get actual categories from data
  loading = false,
}) => {
  // Get actual categories from reports data and merge with predefined ones
  const actualCategories = useMemo(() => {
    if (!reports || reports.length === 0) return categories;

    // Extract unique categories from actual reports
    const reportCategories = [
      ...new Set(
        reports
          .map((report) => report.category)
          .filter((cat) => cat && cat.trim() !== "")
      ),
    ].sort();

    // Merge predefined categories with actual ones, removing duplicates
    const allCategories = [
      "All",
      ...new Set([...categories.slice(1), ...reportCategories]),
    ];

    return allCategories;
  }, [reports, categories]);

  // Get count for each category
  const getCategoryCount = (category) => {
    if (!reports || reports.length === 0) return 0;
    if (category === "All") return reports.length;

    return reports.filter(
      (report) =>
        report.category &&
        report.category.toLowerCase() === category.toLowerCase()
    ).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center text-sm sm:text-base">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Categories
        </h3>
        <span className="text-xs sm:text-sm category-badge bg-gray-100 dark:bg-gray-100 px-2 py-1 rounded-full self-start sm:self-auto">
          {actualCategories.length} available
        </span>
      </div>

      {/* Mobile: Horizontal scroll, Tablet+: Flex wrap */}
      <div className="flex sm:flex-wrap gap-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
        {actualCategories.map((category, index) => {
          const count = getCategoryCount(category);
          const isSelected = category === selectedCategory;

          return (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCategoryChange(category)}
              disabled={loading}
              className={`relative px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 flex-shrink-0 sm:flex-shrink whitespace-nowrap ${
                isSelected
                  ? "bg-gray-100 dark:bg-gray-100 shadow-md category-button-active"
                  : "bg-gray-100 category-button-inactive hover:bg-gray-200 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="relative z-10">{category}</span>
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-gray-200 category-count-active"
                      : "bg-gray-200 category-count-inactive"
                  }`}
                >
                  {count}
                </span>
              )}

              {isSelected && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gray-100 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ delay: 0.3 }}
        className="mt-3 pt-3 border-t border-gray-100"
      >
        <p className="text-xs text-gray-500 text-center">
          {selectedCategory === "All"
            ? `Showing all ${getCategoryCount("All")} reports across categories`
            : `Filtered by ${selectedCategory} • ${getCategoryCount(
                selectedCategory
              )} reports`}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CategoryFilter;
