import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import StatsCards from "./StatsCards";
import VideoCard from "./VideoCard";

const HeroContent = ({ videoSrc, videoTitle, videoDescription }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div className="space-y-8" variants={itemVariants}>
      {/* Stats Cards */}
      <StatsCards />

      {/* Video Card */}
      <VideoCard
        videoSrc={videoSrc}
        videoTitle={videoTitle}
        videoDescription={videoDescription}
      />

      {/* Heading */}
      <motion.div className="space-y-6" variants={itemVariants}>
        <motion.h1
          className="text-5xl lg:text-6xl font-bold leading-tight"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Experience the future of <br />
          <motion.span
            className="text-blue-900"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            media-technology
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 max-w-md leading-relaxed"
          variants={itemVariants}
        >
          Explore the forefront of media-technology with our platform, where
          science meets innovation. Access tools, materials and resources that
          resonate with your passion for media-technology.
        </motion.p>

        <motion.div className="flex items-center space-x-4">
          <motion.button
            className="bg-black text-white px-8 py-4 rounded-full font-medium flex items-center space-x-2 hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/works">Learn More </Link>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.div
            className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HeroContent;
