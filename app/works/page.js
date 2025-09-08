"use client";
import { motion } from "framer-motion";

export default function WorksPage() {
  // Animation variants for text elements
  const fadeInUp = {
    hidden: {
      opacity: 0,
      y: 60,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const fadeInLeft = {
    hidden: {
      opacity: 0,
      x: -60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const fadeInRight = {
    hidden: {
      opacity: 0,
      x: 60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardAnimation = {
    hidden: {
      opacity: 0,
      y: 80,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video Space */}
      <div className="relative bg-white text-black">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.h1
                className="text-5xl font-bold mb-6 leading-tight"
                variants={fadeInLeft}
              >
                How It Works
              </motion.h1>
              <motion.p
                className="text-xl text-black-100 mb-8 leading-relaxed"
                variants={fadeInLeft}
              >
                Learn about how Fleek Reporter transforms media-technology
                experiences through our innovative platform.
              </motion.p>
            </motion.div>

            {/* Right - Video Placeholder */}
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInRight}
            >
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="aboutVideo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl font-bold mb-4" variants={fadeInUp}>
              Get Started Now
            </motion.h2>
            <motion.p className="text-xl text-slate-300" variants={fadeInUp}>
              Join Fleek Reporter and start your journey in media reporting.
              Whether you&apos;re a reporter, a talent, or just curious,
              there&apos;s something for everyone.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {/* Search for Talents */}
            <motion.div
              className="text-center group"
              variants={cardAnimation}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-4">Discover Incidents</h3>
              <p className="text-slate-300 leading-relaxed">
                Search for incidents and become your own reporter. We have
                thousands of incidents waiting for you to discover.
              </p>
            </motion.div>

            {/* Hire and Brief */}
            <motion.div
              className="text-center group"
              variants={cardAnimation}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-4">Report Incidents</h3>
              <p className="text-slate-300 leading-relaxed">
                Report incidents by posting your own media and get feedback from
                the community. You can also hire talents to report incidents for
                you.
              </p>
            </motion.div>

            {/* Get Your Results */}
            <motion.div
              className="text-center group"
              variants={cardAnimation}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-4">Join the Community</h3>
              <p className="text-slate-300 leading-relaxed">
                Join communities of reporters. Share your experiences, get
                insights, and collaborate with others to enhance your media
                reporting skills.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
