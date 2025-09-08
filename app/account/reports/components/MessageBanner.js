"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageBanner({ message }) {
  return (
    <AnimatePresence>
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
            message.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : message.type === "warning"
              ? "bg-yellow-100 border border-yellow-400 text-yellow-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === "success" && (
              <span className="text-green-500 flex-shrink-0">✅</span>
            )}
            {message.type === "warning" && (
              <span className="text-yellow-500 flex-shrink-0">⚠️</span>
            )}
            {message.type === "error" && (
              <span className="text-red-500 flex-shrink-0">❌</span>
            )}
            <span className="break-words">{message.text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
