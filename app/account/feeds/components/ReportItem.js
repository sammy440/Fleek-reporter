import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import MediaViewer from "./MediaViewer";
import ReportModal from "./ReportModal";
import ShareModal from "./ShareModal";
import LikeDisplay from "./LikeDisplay";
import ReportMenu from "./ReportMenu"; // Import the existing menu component
import FollowButton from "./FollowButton";
import { isFollowing } from "../hooks/FeedsDataHandler";

const ReportItem = ({
  report,
  session,
  currentUserProfile,
  onCommentSubmit,
  onLike,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReporterMenu, setShowReporterMenu] = useState(false);
  const moreButtonRef = useRef(null);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await onLike(report.id);
    setIsLiking(false);
  };

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowReporterMenu(!showReporterMenu);
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

  const truncateText = (text, maxLength = 280) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const isOwnReport = session?.user?.id === report.user_id;

  // Follow state
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkFollow = async () => {
      if (!session?.user?.id || !report.user_id || isOwnReport) return;
      setFollowLoading(true);
      const res = await isFollowing(
        window.supabase ||
          (window.supabase =
            require("../../../_lib/supabaseClient").supabaseBrowser),
        session.user.id,
        report.user_id
      );
      if (mounted) setFollowing(res);
      setFollowLoading(false);
    };
    checkFollow();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, [session?.user?.id, report.user_id]);

  return (
    <>
      {/* Tweet-style Card with responsive design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.005, y: -2 }}
        onClick={handleCardClick}
        className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-md mx-4 sm:mx-0"
      >
        {/* Header with user info */}
        <div className="flex items-start space-x-3 mb-3">
          {/* Avatar */}
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

          {/* User info and metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">
                {report.user_name || "Anonymous"}
              </h4>

              <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">
                •
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                {formatDate(report.created_at)}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900">
                {report.category}
              </span>
            </div>
          </div>
          {!isOwnReport && session?.user?.id && report.user_id && (
            <FollowButton
              supabase={
                window.supabase ||
                (window.supabase =
                  require("../../../_lib/supabaseClient").supabaseBrowser)
              }
              currentUserId={session.user.id}
              targetUserId={report.user_id}
              initialIsFollowing={following}
              onFollowChange={setFollowing}
            />
          )}

          {/* More options */}
          <div className="relative">
            <button
              ref={moreButtonRef}
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={handleMoreClick}
              className="text-gray-400 hover:text-gray-600 p-1 sm:block"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>

            {/* Reporter Menu */}
            <ReportMenu
              show={showReporterMenu}
              setShow={setShowReporterMenu}
              report={report}
              triggerRef={moreButtonRef}
              isOwnReport={isOwnReport}
              session={session}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-2">
            {report.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm sm:text-base">
            {truncateText(
              report.content || "This is report content from the database.",
              window.innerWidth < 640 ? 180 : 280
            )}
          </p>
        </div>

        {/* Media (Image/Video) */}
        {report.media_urls && (
          <div className="mb-4">
            <MediaViewer
              mediaUrl={report.media_urls}
              altText="Report content"
              className="rounded-lg sm:rounded-xl"
            />
          </div>
        )}

        {/* Liked by summary */}
        <LikeDisplay report={report} currentUserId={session?.user?.id} />

        {/* Action buttons - Responsive layout */}
        <div className="flex items-center justify-between sm:justify-start sm:space-x-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-full transition-colors text-sm ${
              report.user_has_liked
                ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            }`}
          >
            <motion.svg
              className="w-4 h-4 sm:w-5 sm:h-5"
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
            <span className="font-medium">{report.like_count || 0}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCommentClick}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-medium">{report.comment_count || 0}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShareClick}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Report Modal */}
      <ReportModal
        showModal={showModal}
        setShowModal={setShowModal}
        report={report}
        session={session}
        currentUserProfile={currentUserProfile}
        onCommentSubmit={onCommentSubmit}
        onLike={onLike}
      />

      {/* Share Modal */}
      <ShareModal
        showModal={showShareModal}
        setShowModal={setShowShareModal}
        report={report}
      />
    </>
  );
};

export default ReportItem;
