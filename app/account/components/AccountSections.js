import { motion } from "framer-motion";
import {
  FilePlus2,
  Handshake,
  Rss,
  Send,
  User2Icon,
  UserCog,
} from "lucide-react";

// Account Content Component
export const AccountContent = ({ session, router }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6 lg:p-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Profile Information Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6"
      >
        <h2 className="inline-flex items-center gap-2 text-xs sm:text-sm bg-amber-200 text-amber-700 dark:bg-amber-200 dark:text-amber-800 p-2 w-fit rounded-lg font-semibold mb-4 sm:mb-6">
          <User2Icon className="w-4 h-4" />
          <span>Profile Information</span>
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {session.user.image && (
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={session.user.image}
                alt="Profile"
                className="w-16 h-16 rounded-full border-3 border-white shadow-md mx-auto sm:mx-0"
              />
            )}
            <div className="text-center sm:text-left">
              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                {session.user.name}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base break-all sm:break-normal">
                {session.user.email}
              </p>
            </div>
          </div>
          <div className="mt-6 p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              User ID:{" "}
              <span className="font-mono text-gray-800 dark:text-gray-100 break-all">
                {session.user.id}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6"
      >
        <h2 className="inline-flex items-center gap-2 text-xs sm:text-sm bg-red-200 text-red-700 dark:bg-red-200 dark:text-red-800 p-2 w-fit rounded-lg font-semibold mb-4 sm:mb-6">
          <Send className="w-4 h-4" />
          <span>Quick Actions</span>
        </h2>
        <div className="space-y-3 sm:space-y-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/account/reports")}
            className="w-full sm:w-fit bg-blue-300 text-blue-900 dark:bg-blue-300 dark:text-blue-900 font-bold py-2 px-4 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-400 transition-all shadow-md hover:shadow-lg"
          >
            <span className="inline-flex items-center justify-center sm:justify-start gap-2 w-full">
              <FilePlus2 className="w-4 h-4" />
              <span>Post New Report</span>
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/account/feeds")}
            className="w-full bg-green-300 text-green-900 dark:bg-green-300 dark:text-green-900 font-bold py-2 px-4 rounded-lg hover:bg-green-100 dark:hover:bg-green-400 transition-all shadow-md hover:shadow-lg"
          >
            <span className="inline-flex items-center justify-center gap-2 w-full">
              <Rss className="w-4 h-4" />
              <span>View News Feeds</span>
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/account/profile")}
            className="w-full sm:w-fit bg-gray-300 text-gray-900 dark:bg-gray-300 dark:text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-400 transition-all shadow-md hover:shadow-lg"
          >
            <span className="inline-flex items-center justify-center sm:justify-start gap-2 w-full">
              <UserCog className="w-4 h-4" />
              <span>Edit Profile</span>
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>

    {/* Welcome Section */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-6 lg:mt-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6"
    >
      <h2 className="inline-flex items-center gap-2 text-xs sm:text-sm bg-blue-200 text-blue-700 dark:bg-blue-200 dark:text-blue-800 p-2 w-fit rounded-lg font-semibold mb-3 sm:mb-4">
        <Handshake className="w-4 h-4" />
        <span>Welcome to Fleek Reporter!</span>
      </h2>
      <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm sm:text-base">
        You have successfully signed in. You can now post news reports, read
        feeds from other users, and manage your profile. Use the quick actions
        above to get started.
      </p>
    </motion.div>
  </motion.div>
);
