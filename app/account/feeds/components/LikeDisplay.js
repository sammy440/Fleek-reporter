import { motion } from "framer-motion";

const LikeDisplay = ({ report, currentUserId }) => {
  if (!report.like_count || report.like_count === 0) return null;

  const likers = report.likers || []; // Array of users who liked the post
  const currentUserLiked = likers.some(
    (liker) => liker.user_id === currentUserId
  );

  // Function to generate like text
  const generateLikeText = () => {
    if (report.like_count === 1) {
      if (currentUserLiked) {
        return "You liked this";
      } else {
        return `Liked by ${likers[0]?.user_name || "someone"}`;
      }
    }

    if (report.like_count === 2) {
      if (currentUserLiked) {
        const otherLiker = likers.find(
          (liker) => liker.user_id !== currentUserId
        );
        return `Liked by you and ${otherLiker?.user_name || "1 other"}`;
      } else {
        return `Liked by ${likers[0]?.user_name || "someone"} and ${
          likers[1]?.user_name || "1 other"
        }`;
      }
    }

    // For 3 or more likes
    if (currentUserLiked) {
      const otherLikers = likers.filter(
        (liker) => liker.user_id !== currentUserId
      );
      const firstOtherLiker = otherLikers[0];
      const remainingCount = report.like_count - 2;

      if (remainingCount === 1) {
        return `Liked by you, ${
          firstOtherLiker?.user_name || "someone"
        } and 1 other`;
      } else {
        return `Liked by you, ${
          firstOtherLiker?.user_name || "someone"
        } and ${remainingCount} others`;
      }
    } else {
      const firstLiker = likers[0];
      const secondLiker = likers[1];
      const remainingCount = report.like_count - 2;

      if (remainingCount === 1) {
        return `Liked by ${firstLiker?.user_name || "someone"}, ${
          secondLiker?.user_name || "someone"
        } and 1 other`;
      } else {
        return `Liked by ${firstLiker?.user_name || "someone"}, ${
          secondLiker?.user_name || "someone"
        } and ${remainingCount} others`;
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="px-4 sm:px-6 py-2 border-b border-gray-100"
    >
      <div className="flex items-center space-x-2">
        {/* Heart icons from likers */}
        <div className="flex -space-x-1">
          {likers.slice(0, 3).map((liker, index) => (
            <div
              key={liker.user_id}
              className="relative"
              style={{ zIndex: 3 - index }}
            >
              {liker.user_avatar ? (
                <img
                  src={liker.user_avatar}
                  alt={liker.user_name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Like text */}
        <p className="text-sm text-gray-600">{generateLikeText()}</p>
      </div>
    </motion.div>
  );
};

export default LikeDisplay;
