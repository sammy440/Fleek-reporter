"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("Getting Started");
  const [expandedItems, setExpandedItems] = useState({});

  const categories = [
    "Getting Started",
    "Members and Communities",
    "Post Reports and Feedback",
    "Account & Technical Issues",
  ];

  const faqData = {
    "Getting Started": [
      {
        id: "signup",
        question: "How do I sign up for an account?",
        answer:
          "Signing up is easy! First, download the app, click on 'Sign Up', and follow the prompts. You can use your email address, Google, or Facebook to create an account.",
      },
    ],
    "Members and Communities": [
      {
        id: "communities",
        question: "How do I join a community?",
        answer:
          "To join a community, navigate to the 'Communities' section in the app, browse the available communities, and tap 'Join' on the one you want to be a part of.",
      },
    ],
    "Post Reports and Feedback": [
      {
        id: "reports",
        question: "How do I report an issue?",
        answer:
          "To report an issue, go to the 'Report' section in the app, describe the issue you're facing, and submit your report. Our team will review it and get back to you.",
      },
    ],
    "Account & Technical Issues": [
      {
        id: "offline",
        question: "What do I do if my account is locked or suspended?",
        answer:
          "If your account is locked or suspended, please contact our support team for assistance. They will help you resolve the issue and regain access to your account.",
      },
    ],
  };

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Animation variants
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
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const categoryButtonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const faqItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const answerVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <main className="min-h-screen dark:bg-gray-800 bg-gray-200">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div className="mb-8" variants={itemVariants}>
            <motion.h1
              className="text-4xl font-bold dark:text-white text-gray-900 mb-4"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              FAQs
            </motion.h1>
            <motion.p
              className="text-gray-600 text-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Everything you need to know about features, membership, and
              troubleshooting.
            </motion.p>
          </motion.div>

          {/* Category Buttons */}
          <motion.div
            className="flex flex-wrap gap-3 mb-8"
            variants={itemVariants}
          >
            {categories.map((category, index) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-gray-900 text-white shadow-lg"
                    : " dark:text-gray-800 text-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200"
                }`}
                variants={categoryButtonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: index * 0.1 }}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* FAQ Items */}
          <motion.div className="space-y-4 mb-12" variants={itemVariants}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {faqData[activeCategory]?.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    variants={faqItemVariants}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                    layout
                  >
                    <motion.button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-200 transition-colors duration-200"
                      whileHover={{
                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="font-medium dark:hover:text-black dark:text-white text-gray-900 pr-4">
                        {item.question}
                      </span>
                      <motion.div
                        animate={{
                          rotate: expandedItems[item.id] ? 180 : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        {expandedItems[item.id] ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </motion.div>
                    </motion.button>
                    <AnimatePresence>
                      {expandedItems[item.id] && (
                        <motion.div
                          variants={answerVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="overflow-hidden"
                        >
                          <motion.div
                            className="px-6 pb-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <p className="text-gray-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Contact Support Section */}
          <motion.div className="text-center" variants={itemVariants}>
            <motion.h3
              className="text-xl font-semibold dark:text-white text-gray-900 mb-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Still have questions?
            </motion.h3>
            <motion.p
              className="text-gray-600 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Contact our support team and we will make sure everything is clear
              and intuitive for you!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Link href="/support">
                <motion.button
                  className="bg-gray-900 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{
                    scale: 1.05,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Contact Support
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
