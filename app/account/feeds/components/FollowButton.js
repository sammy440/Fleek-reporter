import { useState, useEffect } from "react";
import {
  followUser,
  unfollowUser,
  isFollowing,
} from "../hooks/FeedsDataHandler";

const FollowButton = ({
  supabase,
  currentUserId,
  targetUserId,
  initialIsFollowing = false,
  onFollowChange,
}) => {
  const [following, setFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollow = async () => {
    setLoading(true);
    if (following) {
      await unfollowUser(supabase, currentUserId, targetUserId);
      setFollowing(false);
      onFollowChange && onFollowChange(false);
    } else {
      await followUser(supabase, currentUserId, targetUserId);
      setFollowing(true);
      onFollowChange && onFollowChange(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
        following
          ? "bg-gray-200 dark:bg-gray-800 text-gray-700 border-gray-300 hover:bg-gray-300"
          : "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
      }`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
