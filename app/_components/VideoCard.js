import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

const VideoCard = ({
  videoSrc,
  videoTitle = "Watch video",
  videoDescription = "Watch this video for insights",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState("4m 38s");
  const videoRef = useRef(null);

  // Video metadata & events
  useEffect(() => {
    const video = videoRef.current;
    if (video && videoSrc) {
      const handleLoadedMetadata = () => {
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        setVideoDuration(`${minutes}m ${seconds}s`);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [videoSrc]);

  const handleVideoToggle = () => {
    if (videoRef.current && videoSrc) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current
          .play()
          .catch((e) => console.log("Video play failed:", e));
      }
    } else {
      setIsPlaying(!isPlaying);
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <motion.div
      className="bg-black backdrop-blur-sm border border-gray-700/50 rounded-2xl p-2 relative overflow-hidden shadow-2xl"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center space-x-3 mb-4">
        {isPlaying ? (
          <Pause className="w-5 h-5 text-blue-400" />
        ) : (
          <Play className="w-5 h-5 text-blue-400" />
        )}
        <span className="text-sm text-gray-300">{videoDuration}</span>
        {isPlaying && (
          <span className="text-xs text-green-400 animate-pulse">
            Playing...
          </span>
        )}
      </div>

      <div className="relative">
        {videoSrc ? (
          <div className="relative group">
            <video
              ref={videoRef}
              className="w-full h-32 object-cover rounded-lg"
              preload="metadata"
              playsInline
              muted
            >
              <source src={videoSrc} type="video/mp4" />
              <source src={videoSrc} type="video/webm" />
              <source src={videoSrc} type="video/ogg" />
              Your browser does not support the video tag.
            </video>

            {/* Video overlay controls */}
            <motion.div
              className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center cursor-pointer transition-opacity duration-300"
              onClick={handleVideoToggle}
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              animate={{ opacity: isPlaying ? 0 : 0.8 }}
            >
              <motion.div
                className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(255,255,255,0.3)",
                }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </motion.div>
            </motion.div>
          </div>
        ) : (
          // Placeholder
          <motion.div
            className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300/30"
            whileHover={{
              scale: 1.02,
              borderColor: "rgba(59, 130, 246, 0.5)",
            }}
            onClick={handleVideoToggle}
          >
            <div className="text-center">
              <motion.div
                className="mb-2"
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{
                  duration: 2,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "linear",
                }}
              >
                {isPlaying ? (
                  <Pause className="w-12 h-12 text-white mx-auto" />
                ) : (
                  <Play className="w-12 h-12 text-white mx-auto" />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        <div className="mt-3">
          <h3 className="text-lg font-semibold text-white">{videoTitle}</h3>
          <p className="text-sm text-gray-400">{videoDescription}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;
