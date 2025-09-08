
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function MediaUploader({
  mediaUrls,
  setMediaUrls,
  setMessage,
  supabase,
  uploadingMedia,
  setUploadingMedia,
  loading,
}) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState("photo"); // 'photo' or 'video'
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  // Upload Media (existing function)
  const handleMediaUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const validImageTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        const validVideoTypes = [
          "video/mp4",
          "video/mpeg",
          "video/quicktime",
          "video/avi",
          "video/webm", // Added for camera recordings
        ];

        if (
          !validImageTypes.includes(file.type) &&
          !validVideoTypes.includes(file.type)
        ) {
          setMessage({
            type: "error",
            text: "Invalid file type (images/videos only)",
          });
          continue;
        }

        const maxSize = validVideoTypes.includes(file.type)
          ? 50 * 1024 * 1024
          : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          setMessage({
            type: "error",
            text: validVideoTypes.includes(file.type)
              ? "Video too large (max 50MB)"
              : "Image too large (max 10MB)",
          });
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("report-media")
          .upload(filePath, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          setMessage({ type: "error", text: `Failed to upload ${file.name}` });
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("report-media").getPublicUrl(filePath);

        uploadedUrls.push({
          url: publicUrl,
          type: validVideoTypes.includes(file.type) ? "video" : "image",
          name: file.name,
        });
      }

      setMediaUrls((prev) => [...prev, ...uploadedUrls]);
      if (uploadedUrls.length > 0) {
        setMessage({
          type: "success",
          text: `${uploadedUrls.length} file(s) uploaded!`,
        });
      }

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to upload media" });
    } finally {
      setUploadingMedia(false);
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      // First, check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMessage({
          type: "error",
          text: "Camera not supported on this device/browser.",
        });
        return;
      }

      // Start with basic constraints and fallback if needed
      let constraints = {
        video: {
          facingMode: "environment", // Use back camera by default
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: cameraMode === "video",
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.log("Failed with environment camera, trying user camera:", err);
        // Fallback to front camera if back camera fails
        constraints.video.facingMode = "user";
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err2) {
          console.log(
            "Failed with user camera, trying basic constraints:",
            err2
          );
          // Final fallback - basic video only
          constraints = {
            video: true,
            audio: cameraMode === "video",
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        }
      }

      streamRef.current = stream;
      setShowCamera(true);

      // Wait a bit for the modal to render, then set up video
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((playErr) => {
              console.error("Failed to play video:", playErr);
              setMessage({
                type: "error",
                text: "Failed to start camera preview.",
              });
            });
          };
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      setMessage({
        type: "error",
        text: `Camera error: ${err.message || "Failed to access camera"}`,
      });
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    }
    setShowCamera(false);
  };

  // Capture Photo
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          await handleMediaUpload([file]);
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  // Start Recording
  const startRecording = async () => {
    if (!streamRef.current) return;

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const file = new File([blob], `video-${Date.now()}.webm`, {
          type: "video/webm",
        });
        await handleMediaUpload([file]);
        stopCamera();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to start recording" });
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Remove media
  const removeMedia = (index) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Switch Camera (front/back)
  const switchCamera = async () => {
    if (!streamRef.current) return;

    // Get current facing mode
    const videoTrack = streamRef.current.getVideoTracks()[0];
    const currentSettings = videoTrack?.getSettings();
    const currentFacingMode = currentSettings?.facingMode;

    stopCamera();

    setTimeout(async () => {
      try {
        let constraints = {
          video: {
            facingMode: currentFacingMode === "user" ? "environment" : "user",
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          },
          audio: cameraMode === "video",
        };

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
          // Fallback to basic constraints if specific facing mode fails
          constraints = {
            video: true,
            audio: cameraMode === "video",
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        }

        streamRef.current = stream;
        setShowCamera(true);

        setTimeout(() => {
          if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch((playErr) => {
                console.error("Failed to play video:", playErr);
              });
            };
          }
        }, 100);
      } catch (err) {
        console.error("Switch camera error:", err);
        setMessage({ type: "error", text: "Failed to switch camera" });
      }
    }, 200);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Media Files (Images/Videos)
      </label>

      {/* Camera Modal */}
      {showCamera && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-opacity-10 flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden">
            {/* Camera Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCameraMode("photo")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    cameraMode === "photo"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 text-gray-200"
                  }`}
                >
                  Photo
                </button>
                <button
                  onClick={() => setCameraMode("video")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    cameraMode === "video"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 text-gray-200"
                  }`}
                >
                  Video
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={switchCamera}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                  title="Switch Camera"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </button>

                <button
                  onClick={stopCamera}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  title="Close Camera"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Camera View */}
            <div className="relative aspect-video bg-gray-900">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline={true}
                muted={true}
                autoPlay={true}
                controls={false}
                style={{
                  transform: "scaleX(-1)",
                  backgroundColor: "#000",
                  objectFit: "cover",
                }}
                onLoadedMetadata={() => {
                  console.log("Video metadata loaded");
                  if (videoRef.current) {
                    videoRef.current.play().catch(console.error);
                  }
                }}
                onCanPlay={() => {
                  console.log("Video can play");
                }}
                onPlaying={() => {
                  console.log("Video is playing");
                }}
                onError={(e) => {
                  console.error("Video error:", e);
                }}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Video debug info */}
              <div className="absolute top-16 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
                <p>Stream: {streamRef.current ? "Active" : "None"}</p>
                <p>Video Ready: {videoRef.current?.readyState || 0}</p>
                <p>Playing: {videoRef.current?.playing ? "Yes" : "No"}</p>
              </div>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6 flex justify-center items-center space-x-6">
              {cameraMode === "photo" ? (
                <button
                  onClick={capturePhoto}
                  disabled={uploadingMedia}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                  title="Capture Photo"
                >
                  <div className="w-12 h-12 bg-black rounded-full"></div>
                </button>
              ) : (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={uploadingMedia}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-white hover:bg-gray-200"
                  }`}
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  {isRecording ? (
                    <div className="w-6 h-6 bg-white rounded-sm"></div>
                  ) : (
                    <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                  )}
                </button>
              )}
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-20 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Upload Options */}
      <div className="space-y-4">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleMediaUpload(Array.from(e.target.files))}
            className="hidden"
            id="media-upload"
            disabled={uploadingMedia || loading}
          />
          <label
            htmlFor="media-upload"
            className={`cursor-pointer ${
              uploadingMedia || loading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <div className="text-gray-500">
              <svg
                className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mb-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm sm:text-base">
                {uploadingMedia ? "Uploading..." : "Click to upload files"}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Max 10MB (images), 50MB (videos)
              </p>
            </div>
          </label>
        </div>

        {/* Camera Button */}
        <div className="flex justify-center space-x-3">
          <button
            type="button"
            onClick={startCamera}
            disabled={uploadingMedia || loading || showCamera}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Use Camera</span>
          </button>
        </div>
      </div>

      {/* Media Preview */}
      {mediaUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {mediaUrls.map((media, index) => (
            <div key={index} className="relative group">
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-16 sm:h-20 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={media.url}
                  className="w-full h-16 sm:h-20 object-cover rounded-lg"
                  controls={false}
                />
              )}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
