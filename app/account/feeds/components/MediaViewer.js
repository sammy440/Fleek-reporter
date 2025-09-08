import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeftFromCircle } from "lucide-react";

const MediaViewer = ({
  mediaUrl,
  altText = "Media content",
  className = "",
}) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!mediaUrl) return null;

  // Handle array of URLs (take first one) or single URL string
  const actualMediaUrl = Array.isArray(mediaUrl) ? mediaUrl[0] : mediaUrl;

  if (!actualMediaUrl) return null;

  // Determine if the media is a video or image
  const isVideo =
    /\.(mp4|webm|ogg|mov|avi|mkv|m4v)$/i.test(actualMediaUrl) ||
    actualMediaUrl.includes("video") ||
    actualMediaUrl.includes(".mp4") ||
    actualMediaUrl.includes(".webm") ||
    actualMediaUrl.includes(".mov") ||
    (actualMediaUrl.includes("supabase") && actualMediaUrl.includes("videos"));

  const handleMediaLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleMediaError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleMediaClick = (e) => {
    e.stopPropagation();
    setShowFullscreen(true);
  };

  if (hasError) {
    return (
      <div
        className={`bg-gray-100 border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-center h-32 sm:h-48 text-gray-500">
          <div className="text-center">
            <svg
              className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs sm:text-sm">Failed to load media</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative cursor-pointer rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 ${className}`}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {isVideo ? (
          <motion.video
            whileHover={{ scale: 1.02 }}
            onClick={handleMediaClick}
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            className="w-full h-48 sm:h-64 object-cover cursor-pointer"
            controls={false}
            muted
            playsInline
            preload="metadata"
            poster={actualMediaUrl.replace(
              /\.(mp4|webm|ogg|mov|avi|mkv|m4v)$/i,
              ".jpg"
            )}
          >
            <source src={actualMediaUrl} type="video/mp4" />
            <source src={actualMediaUrl} type="video/webm" />
            <source src={actualMediaUrl} type="video/ogg" />
            Your browser does not support the video tag.
          </motion.video>
        ) : (
          <motion.img
            whileHover={{ scale: 1.02 }}
            onClick={handleMediaClick}
            onLoad={handleMediaLoad}
            onError={handleMediaError}
            src={actualMediaUrl}
            alt={altText}
            className="w-full h-48 sm:h-64 object-cover"
          />
        )}

        {/* Play button overlay for videos */}
        {isVideo && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-black bg-opacity-60 rounded-full p-3 sm:p-4 backdrop-blur-sm pointer-events-auto cursor-pointer"
              onClick={handleMediaClick}
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setShowFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFullscreen(false)}
                className="absolute -top-8 sm:-top-12 right-0 text-white hover:text-gray-300 z-10"
              >
                <ArrowDownLeftFromCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              </motion.button>

              {/* Full size media */}
              {isVideo ? (
                <video
                  className="w-full max-h-[80vh] object-contain rounded-lg"
                  controls
                  autoPlay
                  muted={false}
                  playsInline
                  onLoadStart={() => console.log("Video loading started")}
                  onError={(e) => console.error("Video error:", e)}
                >
                  <source src={actualMediaUrl} type="video/mp4" />
                  <source src={actualMediaUrl} type="video/webm" />
                  <source src={actualMediaUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={actualMediaUrl}
                  alt={altText}
                  className="w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MediaViewer;
