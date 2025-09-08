import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, ArrowRight } from "lucide-react";

const StatsCards = () => {
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="flex flex-wrap gap-4">
      <motion.div
        className="bg-black backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 flex items-center space-x-3"
        whileHover={{ scale: 1.05 }}
        animate={pulseAnimation}
      >
        <BarChart3 className="w-6 h-6 text-blue-400" />
        <div>
          <div className="text-2xl text-white font-bold">32K+</div>
          <div className="text-xs text-gray-400">Active users</div>
        </div>
      </motion.div>

      <motion.div
        className="bg-black backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 flex items-center space-x-3"
        whileHover={{ scale: 1.05 }}
        animate={{
          ...pulseAnimation,
          transition: { ...pulseAnimation.transition, delay: 1 },
        }}
      >
        <Users className="w-6 h-6 text-green-400" />
        <div>
          <div className="text-2xl text-white font-bold">12+</div>
          <ArrowRight className="w-4 h-4 text-gray-400 inline ml-2" />
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards;
