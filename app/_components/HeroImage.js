import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Atom } from "lucide-react";

const HeroImage = ({ imageSrc, openAuthModal }) => {
  return (
    <div className="relative h-96 lg:h-full min-h-[400px] rounded-3xl border-white/20 shadow-2xl">
      {imageSrc ? (
        <motion.div
          className="absolute inset-0 rounded-3xl overflow-hidden backdrop-blur-sm border border-gray-700/50 group"
          whileHover={{ scale: 1.02 }}
        >
          <img
            src={imageSrc}
            alt="Custom content"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
        </motion.div>
      ) : (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-orange-400/30 rounded-3xl backdrop-blur-sm border border-gray-700/50 overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          {/* Static placeholder content - NO FLOATING ANIMATIONS */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 opacity-70">
                <Atom className="w-full h-full" />
              </div>
              <p className="text-lg font-medium">Media Technology</p>
              <p className="text-sm opacity-70">Innovation & Science</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info overlay */}
      <motion.div
        className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          Join our platform
        </h3>
        <p className="text-sm text-gray-300 mb-3">Take few minutes to start</p>
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          whileHover={{ x: 5 }}
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <button onClick={openAuthModal}>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroImage;
