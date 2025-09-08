"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import AuthForm from "./AuthForm";
import PromotionalContent from "./PromotionalContent";

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(true);

  const switchMode = () => {
    setIsSignUp(!isSignUp);
  };

  // Reset form when modal closes
  const handleClose = () => {
    setIsSignUp(true); // Reset to signup mode
    onClose && onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop with blur */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{ backdropFilter: "blur(8px)" }}
          exit={{ backdropFilter: "blur(0px)" }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md sm:max-w-2xl lg:max-w-5xl h-[90vh] sm:h-[600px] lg:h-[650px] overflow-hidden flex flex-col lg:flex-row"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600 sm:w-6 sm:h-6" />
          </button>

          {/* Form Section */}
          <div className="w-full lg:w-1/2 p-6 lg:text-[2px] sm:p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
            <AnimatePresence mode="wait">
              <AuthForm
                isSignUp={isSignUp}
                onSwitchMode={switchMode}
                onClose={handleClose}
              />
            </AnimatePresence>
          </div>

          {/* Right Side - Promotional Content */}
          <PromotionalContent />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
