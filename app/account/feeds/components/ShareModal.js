import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Link2,
} from "lucide-react";

const ShareModal = ({ showModal, setShowModal, report }) => {
  const [copied, setCopied] = useState(false);

  if (!showModal || !report) return null;

  const shareUrl = `${window.location.origin}/reports/${report.id}`;
  const shareText = `Check out this report: ${report.title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      url: `https://wa.me/?text=${encodeURIComponent(
        `${shareText} ${shareUrl}`
      )}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      color: "bg-black",
      hoverColor: "hover:bg-gray-800",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700",
      hoverColor: "hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
    },
  ];

  const handleShare = (url) => {
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowModal(false)}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Share Report</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Report Preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
              {report.title}
            </h4>
            <p className="text-gray-600 text-xs line-clamp-2">
              {report.content?.substring(0, 100)}...
            </p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
              {report.category}
            </span>
          </div>

          {/* Share Options */}
          <div className="space-y-3 mb-4">
            {shareOptions.map((option, index) => (
              <motion.button
                key={option.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleShare(option.url)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl ${option.color} ${option.hoverColor} text-white transition-colors`}
              >
                <option.icon className="w-5 h-5" />
                <span className="font-medium">{option.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-3">
              <Link2 className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-gray-700 text-sm focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;
