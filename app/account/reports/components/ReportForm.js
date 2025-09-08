"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import MediaUploader from "./MediaUploader";

export default function ReportForm({
  formData,
  setFormData,
  mediaUrls,
  setMediaUrls,
  setMessage,
  supabase,
  session,
  loading,
  setLoading,
  uploadingMedia,
  setUploadingMedia,
}) {
  const [localForm, setLocalForm] = useState(formData);

  // Sync input changes
  const handleInputChange = (e) => {
    setLocalForm({
      ...localForm,
      [e.target.name]: e.target.value,
    });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Report
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setMessage({ type: "error", text: "Please sign in to submit reports" });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({ type: "error", text: "Title and content are required" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const mediaType =
        mediaUrls.length > 0
          ? mediaUrls.some((m) => m.type === "video")
            ? mediaUrls.some((m) => m.type === "image")
              ? "mixed"
              : "video"
            : "image"
          : null;

      const reportData = {
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        location: formData.location.trim() || null,
        user_id: session.user.id,
        media_urls: mediaUrls.length > 0 ? mediaUrls.map((m) => m.url) : null,
        media_type: mediaType,
        status: "published",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("reports").insert([reportData]);

      if (error) {
        setMessage({
          type: "error",
          text: `Failed to create report: ${error.message}`,
        });
        return;
      }

      setFormData({ title: "", category: "", content: "", location: "" });
      setMediaUrls([]);
      setMessage({ type: "success", text: "Report published successfully!" });

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to submit report" });
    } finally {
      setLoading(false);
    }
  };

  // Save as Draft
  const saveAsDraft = async () => {
    if (!session?.user?.id) {
      setMessage({ type: "error", text: "Please sign in to save drafts" });
      return;
    }

    if (!formData.title.trim() && !formData.content.trim()) {
      setMessage({ type: "warning", text: "Nothing to save as draft" });
      return;
    }

    setLoading(true);

    try {
      const draftData = {
        title: formData.title.trim() || "Untitled Draft",
        category: formData.category,
        content: formData.content.trim(),
        location: formData.location.trim() || null,
        user_id: session.user.id,
        media_urls: mediaUrls.length > 0 ? mediaUrls.map((m) => m.url) : null,
        media_type: mediaUrls.length > 0 ? "mixed" : null,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("reports").insert([draftData]);

      if (error) {
        setMessage({
          type: "error",
          text: `Failed to save draft: ${error.message}`,
        });
      } else {
        setMessage({ type: "success", text: "Draft saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save draft" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full"
    >
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-lg dark:text-white sm:text-xl mb-4 sm:mb-6 text-gray-900">
          Create News Report
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Enter report title..."
              required
              disabled={loading}
            />
          </div>

          {/* Category and Location - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2.5 dark:bg-blue-950 dark:text-white sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                required
                disabled={loading}
              >
                <option value="">Select category...</option>
                <option value="technology">Technology</option>
                <option value="politics">Politics</option>
                <option value="sports">Sports</option>
                <option value="entertainment">Entertainment</option>
                <option value="science">Science</option>
                <option value="business">Business</option>
                <option value="health">Health</option>
                <option value="breaking-news">Breaking News</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="e.g., Lagos, Nigeria"
                disabled={loading}
              />
            </div>
          </div>

          {/* Media Upload - Now using the separate component */}
          <MediaUploader
            mediaUrls={mediaUrls}
            setMediaUrls={setMediaUrls}
            setMessage={setMessage}
            supabase={supabase}
            uploadingMedia={uploadingMedia}
            setUploadingMedia={setUploadingMedia}
            loading={loading}
          />

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
              placeholder="Write your detailed report content here..."
              required
              disabled={loading}
            />
          </div>

          {/* Action Buttons - Responsive layout */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || uploadingMedia}
              className="flex-1 bg-gray-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-400 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-none"
            >
              {loading ? "Publishing..." : "Publish Report"}
            </button>
            <button
              type="button"
              onClick={saveAsDraft}
              disabled={loading || uploadingMedia}
              className="bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-2 sm:order-none"
            >
              Save Draft
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
