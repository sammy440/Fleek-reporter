import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MediaViewer from "./MediaViewer";

const ReportModal = ({
  showModal,
  setShowModal,
  report,
  session,
  currentUserProfile,
  onCommentSubmit,
  onLike,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    await onCommentSubmit(report.id, commentText);
    setCommentText("");
    setIsSubmittingComment(false);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await onLike(report.id);
    setIsLiking(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "A";
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        onClick={() => setShowModal(false)}
      >
        <motion.div
          initial={{
            scale: 0.9,
            opacity: 0,
            y: window.innerWidth < 640 ? "100%" : 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
          }}
          exit={{
            scale: 0.9,
            opacity: 0,
            y: window.innerWidth < 640 ? "100%" : 0,
          }}
          className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl sm:w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - Sticky */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Report Details
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Report Header */}
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0">
                {report.user_avatar ? (
                  <img
                    src={report.user_avatar}
                    alt={report.user_name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(report.user_name)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                    {report.user_name || "Anonymous"}
                  </h4>
                  <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">
                    •
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    {formatDate(report.created_at)}
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900 mt-1">
                  {report.category}
                </span>
              </div>
            </div>

            {/* Full Content */}
            <div className="mb-6">
              <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-3">
                {report.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm sm:text-base">
                {report.content || "This is report content from the database."}
              </p>
            </div>

            {/* Media Viewer */}
            {report.media_urls && (
              <div className="mb-6">
                <MediaViewer
                  mediaUrl={report.media_urls}
                  altText="Report content"
                  className="rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}

            {/* Action Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 py-4 border-y border-gray-200 dark:border-gray-800 mb-6 gap-3 sm:gap-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-full transition-colors text-sm ${
                  report.user_has_liked
                    ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                }`}
              >
                <motion.svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill={report.user_has_liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={isLiking ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </motion.svg>
                <span className="font-medium">
                  {report.like_count || 0} likes
                </span>
              </motion.button>
              <span className="text-gray-600 dark:text-gray-400 text-center sm:text-left text-sm">
                {report.comment_count || 0} comments
              </span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {currentUserProfile?.avatar_url ? (
                    <img
                      src={currentUserProfile.avatar_url}
                      alt="Your avatar"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      {getInitials(
                        currentUserProfile?.name || session.user.name
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isSubmittingComment}
                  />
                  <div className="flex justify-end mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                    >
                      {isSubmittingComment ? "Posting..." : "Comment"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {report.comments?.length > 0 ? (
                report.comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {comment.user_avatar ? (
                        <img
                          src={comment.user_avatar}
                          alt={comment.user_name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                          {getInitials(comment.user_name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                        <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                          {comment.user_name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportModal;
