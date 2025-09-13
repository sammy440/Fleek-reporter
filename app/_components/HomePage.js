"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Zap, Atom, Microscope, BarChart3 } from "lucide-react";
import AuthModal from "./AuthModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

const HomePage = ({
  videoSrc,
  imageSrc,
  videoTitle = "Watch video",
  videoDescription = "Watch this video for insights",
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleNavigation = (url) => {
    console.log("Navigating to:", url);
    router.push(url);
    setIsMobileMenuOpen(false);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  if (status === "authenticated") {
    router.replace("/account");
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-white text-black overflow-hidden">
        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              {/* Left Column */}
              <HeroContent
                videoSrc={videoSrc}
                videoTitle={videoTitle}
                videoDescription={videoDescription}
              />

              {/* Right Column */}
              <motion.div className="relative" variants={itemVariants}>
                <HeroImage imageSrc={imageSrc} openAuthModal={openAuthModal} />
              </motion.div>
            </div>

            {/* Bottom categories */}
            <motion.div
              className="mt-16 max-w-7xl mx-auto"
              variants={itemVariants}
            >
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {[
                  {
                    icon: Search,
                    label: "information",
                    color: "text-blue-400",
                  },
                  { icon: Atom, label: "interacts", color: "text-green-400" },
                  { icon: Zap, label: "capture", color: "text-purple-400" },
                  {
                    icon: Microscope,
                    label: "micro-world",
                    color: "text-orange-400",
                  },
                  {
                    icon: BarChart3,
                    label: "media-technology",
                    color: "text-pink-400",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="bg-black backdrop-blur-sm border border-gray-700/50 rounded-full px-6 py-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm text-gray-300">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default HomePage;
