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
  ExternalLink,
  Users,
} from "lucide-react";

const ShareModal = ({ showModal, setShowModal, report }) => {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState("public"); // "public" or "private"

  if (!showModal || !report) return null;

  // Generate different URLs based on share type
  const publicShareUrl = `${window.location.origin}/public/reports/${report.id}`;
  const privateShareUrl = `${window.location.origin}/account/feeds?report=${report.id}`;
  
  const shareUrl = shareType === "public" ? publicShareUrl : privateShareUrl;
  const shareText = `Check out this report: ${report.title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      )}&quote=${encodeURIComponent(shareText)}`,
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
      )}&title=${encodeURIComponent(report.title)}&summary=${encodeURIComponent(
        report.content?.substring(0, 200) || ''
      )}`,
    },
  ];

  const handleShare = (url) => {
    window.open(url, "_blank", "width=600,height=400,resizable=yes,scrollbars=yes");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          handleCopyLink(); // Fallback to copy link
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowModal(false)}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Share Report</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Report Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">
              {report.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2">
              {report.content?.substring(0, 100)}...
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900">
                {report.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                By {report.user_name || 'Anonymous'}
              </span>
            </div>
          </div>

          {/* Share Type Toggle */}
          <div className="mb-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setShareType("public")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                  shareType === "public"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Public Link</span>
              </button>
              <button
                onClick={() => setShareType("private")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                  shareType === "private"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>App Link</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {shareType === "public" 
                ? "Anyone can view this report without signing up"
                : "Viewers need to sign in to read the full report"
              }
            </p>
          </div>

          {/* Native Share (Mobile) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center space-x-3 p-3 mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all hover:from-blue-600 hover:to-purple-700"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-medium">Share via Device</span>
            </motion.button>
          )}

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
                <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
              </motion.button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <Link2 className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none select-all"
                onClick={(e) => e.target.select()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-800"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-200 dark:text-blue-800 dark:hover:bg-blue-300"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </motion.button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> {shareType === "public" ? 
                "Public links help grow your audience and may encourage new users to join the platform." :
                "App links require sign-in but provide the full interactive experience with comments and likes."
              }
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;
