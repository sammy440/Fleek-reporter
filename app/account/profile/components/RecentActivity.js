"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const RecentActivity = ({ activities = [] }) => {
  // Sort activities by time (most recent first) and ensure all activities are displayed
  const displayActivities = useMemo(() => {
    if (!Array.isArray(activities)) {
      console.warn("Activities prop is not an array:", activities);
      return [];
    }

    return activities
      .filter((activity) => activity && typeof activity === "object") // Filter out invalid activities
      .sort((a, b) => {
        // Sort by timestamp if available, otherwise maintain original order
        if (a.time && b.time) {
          return new Date(b.time) - new Date(a.time);
        }
        return 0;
      });
  }, [activities]);

  const getActivityStyles = (type) => {
    switch (type?.toLowerCase()) {
      case "report":
        return {
          containerBg: "bg-blue-100",
          dotBg: "bg-blue-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "comment":
        return {
          containerBg: "bg-purple-100",
          dotBg: "bg-purple-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "profile":
        return {
          containerBg: "bg-green-100",
          dotBg: "bg-green-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "follow":
        return {
          containerBg: "bg-pink-100",
          dotBg: "bg-pink-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "like":
        return {
          containerBg: "bg-red-100",
          dotBg: "bg-red-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "share":
        return {
          containerBg: "bg-indigo-100",
          dotBg: "bg-indigo-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          ),
        };
      case "message":
        return {
          containerBg: "bg-yellow-100",
          dotBg: "bg-yellow-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          ),
        };
      case "notification":
        return {
          containerBg: "bg-orange-100",
          dotBg: "bg-orange-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          ),
        };
      default:
        return {
          containerBg: "bg-gray-100",
          dotBg: "bg-gray-600",
          icon: (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  };

  const renderActivityContent = (activity) => {
    // Enhanced rendering logic to handle different activity types
    switch (activity.type?.toLowerCase()) {
      case "follow":
        if (activity.follower) {
          return (
            <div className="flex items-center space-x-2">
              {activity.follower.avatar_url && (
                <div className="flex-shrink-0">
                  <img
                    src={activity.follower.avatar_url}
                    alt={activity.follower.name || "User"}
                    className="w-6 h-6 rounded-full border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium dark:text-white text-gray-900 break-words leading-relaxed">
                  <span className="font-semibold text-pink-600">
                    {activity.follower.name || "Someone"}
                  </span>{" "}
                  started following you
                </p>
              </div>
            </div>
          );
        }
        break;

      case "like":
        return (
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium dark:text-white text-gray-900 break-words leading-relaxed">
              {activity.user ? (
                <>
                  <span className="font-semibold text-red-600">
                    {activity.user.name || activity.user.username || "Someone"}
                  </span>{" "}
                  liked your {activity.target_type || "post"}
                </>
              ) : (
                activity.action ||
                `Someone liked your ${activity.target_type || "post"}`
              )}
            </p>
          </div>
        );

      case "comment":
        return (
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium dark:text-white text-gray-900 break-words leading-relaxed">
              {activity.user ? (
                <>
                  <span className="font-semibold text-purple-600">
                    {activity.user.name || activity.user.username || "Someone"}
                  </span>{" "}
                  commented on your {activity.target_type || "post"}
                </>
              ) : (
                activity.action ||
                `Someone commented on your ${activity.target_type || "post"}`
              )}
            </p>
            {activity.preview && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                &quot;{activity.preview}&quot;
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium dark:text-white text-gray-900 break-words leading-relaxed">
              {activity.action ||
                activity.description ||
                `${activity.type || "Activity"} occurred`}
            </p>
            {activity.details && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {activity.details}
              </p>
            )}
          </div>
        );
    }

    // Fallback rendering
    return (
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-medium dark:text-white text-gray-900 break-words leading-relaxed">
          {activity.action ||
            activity.description ||
            `${activity.type || "Activity"} occurred`}
        </p>
      </div>
    );
  };

  const getBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "report":
        return "bg-blue-100 text-blue-800";
      case "comment":
        return "bg-purple-100 text-purple-800";
      case "profile":
        return "bg-green-100 text-green-800";
      case "follow":
        return "bg-pink-100 text-pink-800";
      case "like":
        return "bg-red-100 text-red-800";
      case "share":
        return "bg-indigo-100 text-indigo-800";
      case "message":
        return "bg-yellow-100 text-yellow-800";
      case "notification":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Debug logging (remove in production)
  console.log("Activities received:", activities);
  console.log("Display activities:", displayActivities);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="font-semibold text-lg sm:text-xl dark:text-white text-gray-900">
          Recent Activity
        </h3>
        {displayActivities.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All ({displayActivities.length})
          </motion.button>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {displayActivities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              No recent activity
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Your activities will appear here
            </p>
          </motion.div>
        ) : (
          displayActivities.map((activity, index) => {
            const styles = getActivityStyles(activity.type, activity.action);
            const activityId =
              activity.id || activity._id || `activity-${index}`;

            return (
              <motion.div
                key={activityId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
              >
                {/* Activity Icon */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${styles.containerBg} flex-shrink-0`}
                >
                  {styles.icon}
                </div>

                {/* Activity Content */}
                {renderActivityContent(activity)}

                {/* Activity Metadata */}
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-xs sm:text-sm dark:text-white text-gray-500">
                      {activity.time ? timeAgo(activity.time) : "Unknown time"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeColor(
                      activity.type,
                      activity.action
                    )}`}
                  >
                    {activity.type
                      ? activity.type.charAt(0).toUpperCase() +
                        activity.type.slice(1)
                      : "Activity"}
                  </span>
                </div>

                {/* Arrow Icon */}
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Show More Button */}
      {displayActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 sm:mt-6 pt-4 border-t border-gray-200"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-50 text-gray-700 py-2 sm:py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base font-medium border border-gray-200"
          >
            Load More Activities
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentActivity;
