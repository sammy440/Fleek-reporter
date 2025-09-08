"use client";

import { motion, AnimatePresence } from "framer-motion";

const ProfileForm = ({
  profileData,
  isEditing,
  loading,
  handleInputChange,
  handleSave,
  handleCancel,
}) => {
  return (
    <div className="lg:col-span-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <motion.input
              whileFocus={
                isEditing
                  ? {
                      scale: 1.02,
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }
                  : {}
              }
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg transition-all text-sm sm:text-base ${
                isEditing
                  ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <motion.input
              whileFocus={isEditing ? { scale: 1.02 } : {}}
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg transition-all text-sm sm:text-base ${
                isEditing
                  ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {/* Location and Phone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <motion.input
              whileFocus={isEditing ? { scale: 1.02 } : {}}
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., Lagos, Nigeria"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg transition-all text-sm sm:text-base ${
                isEditing
                  ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <motion.input
              whileFocus={isEditing ? { scale: 1.02 } : {}}
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="+234 123 456 7890"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg transition-all text-sm sm:text-base ${
                isEditing
                  ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <motion.input
            whileFocus={isEditing ? { scale: 1.02 } : {}}
            type="url"
            name="website"
            value={profileData.website}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="https://your-website.com"
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg transition-all text-sm sm:text-base ${
              isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <motion.textarea
            whileFocus={isEditing ? { scale: 1.02 } : {}}
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
            placeholder="Tell us about yourself..."
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg transition-all resize-none text-sm sm:text-base ${
              isEditing
                ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
          />
        </div>

        {/* Action Buttons - Responsive */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-200"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? "Saving..." : "Save Changes"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProfileForm;
