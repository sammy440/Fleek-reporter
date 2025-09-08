"use client";

import { motion } from "framer-motion";

const ProfileHeader = ({
  isEditing,
  setIsEditing,
  profileData,
  session,
  uploadingAvatar,
  handleAvatarChange,
  reportCount,
  viewsCount,
  likesCount,
  followersCount = 0,
  followingCount = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="text-center lg:col-span-1"
    >
      {/* Avatar Section */}
      <div className="relative inline-block mb-4 sm:mb-6">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={
            profileData.avatar_url ||
            session.user.image ||
            "/default-avatar.png"
          }
          alt="Profile"
          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg mx-auto object-cover"
        />

        {/* Loading overlay for avatar upload */}
        {uploadingAvatar && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"
            />
          </div>
        )}

        {/* Edit Avatar Button - always visible */}
        <motion.label
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute bottom-0 right-0 text-white rounded-full p-2 transition-colors cursor-pointer shadow-lg ${
            uploadingAvatar
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploadingAvatar ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-3 h-3 sm:w-4 sm:h-4"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
              </svg>
            </motion.div>
          ) : (
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploadingAvatar}
            className="hidden"
          />
        </motion.label>
      </div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-4 sm:mb-6"
      >
        <h3 className="text-lg sm:text-xl font-semibold dark:text-white text-gray-900 mb-1 sm:mb-2">
          {profileData.name || session.user.name}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 break-all px-2 sm:px-0">
          {profileData.email}
        </p>
      </motion.div>

      {/* Profile Stats - Responsive Grid */}
      <div className="grid grid-cols-2 p-5 text-white sm:grid-cols-4 gap-3 text-[10px] sm:gap-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className=" rounded-lg p-3 sm:p-4"
        >
          <p className="text-[15px] sm:text-[15px] font-bold text-blue-600">
            {reportCount}
          </p>
          <p className="text-[15px] sm:text-[15px] text-gray-600">Reports</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className=" rounded-lg p-3 sm:p-4"
        >
          <p className="text-[15px] sm:text-[15px] font-bold text-green-600">
            {likesCount ?? 0}
          </p>
          <p className="text-[15px] sm:text-[15px] text-gray-600">Likes</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className=" rounded-lg p-3 sm:p-4"
        >
          <p className="text-[15px] sm:text-[15px] font-bold text-purple-600">
            {followersCount}
          </p>
          <p className="text-[15px] sm:text-[15px] lg:ml-[-20px] text-gray-600">
            Followers
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className=" rounded-lg p-3 sm:p-4"
        >
          <p className="text-[15px] sm:text-[15px] font-bold text-pink-600">
            {followingCount}
          </p>
          <p className="text-[12px] sm:text-[15px] lg:ml-[-20px] text-gray-600">
            Following
          </p>
        </motion.div>
      </div>

      {/* Bio Section (if exists and not editing) */}
      {profileData.bio && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg"
        >
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {profileData.bio}
          </p>
        </motion.div>
      )}

      {/* Additional Info (if exists and not editing) */}
      {!isEditing && (profileData.location || profileData.website) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 sm:mt-6 space-y-2"
        >
          {profileData.location && (
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-600">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="break-all">{profileData.location}</span>
            </div>
          )}
          {profileData.website && (
            <div className="flex items-center justify-center text-xs sm:text-sm text-blue-600 hover:text-blue-700">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <a
                href={profileData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all hover:underline"
              >
                {profileData.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfileHeader;
