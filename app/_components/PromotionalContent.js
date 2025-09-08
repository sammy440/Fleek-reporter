"use client";

import { motion } from "framer-motion";

export default function PromotionalContent() {
  return (
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-700 to-gray-900 p-12 flex-col justify-center text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-20 h-20 border border-white/20 rounded-lg"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border border-white/20 rounded-lg"></div>
        <div className="absolute bottom-32 right-8 w-12 h-12 border border-white/20 rounded-lg"></div>
        <div className="absolute bottom-20 right-24 w-8 h-8 border border-white/20 rounded-lg"></div>
      </div>

      {/* Analytics Cards */}
      <div className="relative z-10 mb-8">
        {/* Main Analytics Card */}
        <motion.div
          className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white/90">
              User Analytics
            </h3>
            <div className="flex space-x-2 text-xs text-white/70">
              <span className="bg-white/20 px-2 py-1 rounded">Weekly</span>
              <span>Monthly</span>
              <span>Yearly</span>
            </div>
          </div>

          {/* Mock Chart */}
          <div className="h-20 flex items-end space-x-1 mb-4">
            <div className="w-8 bg-white/30 h-12 rounded-t"></div>
            <div className="w-8 bg-white/40 h-16 rounded-t"></div>
            <div className="w-8 bg-white/35 h-14 rounded-t"></div>
            <div className="w-8 bg-white/50 h-18 rounded-t"></div>
            <div className="w-8 bg-white/45 h-20 rounded-t"></div>
          </div>

          <div className="flex justify-between text-xs text-white/60">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          className="bg-white/15 backdrop-blur-sm rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                100% Effective
              </div>
              <div className="text-sm text-white/70">Success Rate</div>
            </div>
            <div className="w-16 h-16 relative">
              {/* Simplified donut chart */}
              <div className="absolute inset-0 border-4 border-white rounded-full"></div>
              <div className="absolute inset-0 border-4 border-white border-r-transparent border-b-transparent rounded-full transform rotate-45"></div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <h2 className="text-xl font-bold mb-4">
          Simple way to be your own reporter
        </h2>
        <p className="text-white/80 text-sm leading-relaxed">
          Welcome to Fleek Reporter! Your go-to solution for reporting news and
          incidents with ease and reliability.
        </p>
      </motion.div>
    </div>
  );
}
