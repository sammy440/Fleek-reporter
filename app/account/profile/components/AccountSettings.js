"use client";

import { motion } from "framer-motion";

const AccountSettings = () => {
  const settingsItems = [
    {
      title: "Email Preferences",
      description: "Configure notification settings",
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      ),
      bgColor: "bg-green-100",
    },
    {
      title: "Security",
      description: "Password and security settings",
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: "bg-purple-100",
    },
    {
      title: "Privacy",
      description: "Manage your privacy settings",
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
            clipRule="evenodd"
          />
          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
        </svg>
      ),
      bgColor: "bg-blue-100",
    },
    {
      title: "Data Export",
      description: "Download your data",
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
    >
      <h3 className="font-semibold text-lg sm:text-xl mb-4 sm:mb-6 dark:text-white text-gray-900">
        Profile Settings
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {settingsItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-50 rounded-lg p-3 sm:p-4 cursor-pointer border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {item.title}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 break-words">
                  {item.description}
                </p>
              </div>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
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
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">
          Quick Actions
        </h4>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
          >
            Change Password
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-red-50 text-red-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
          >
            Delete Account
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountSettings;
