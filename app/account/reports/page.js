"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Sidebar from "../../_components/Sidebar";
import MessageBanner from "./components/MessageBanner";
import ReportForm from "./components/ReportForm";
import TipsSection from "./components/TipsSection";

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [activeSection, setActiveSection] = useState("reports");
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    location: "",
  });
  const [mediaUrls, setMediaUrls] = useState([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-gray-600 mx-auto mb-4"
          />
          <p className="text-sm sm:text-base">
            {uploadingMedia
              ? "Uploading media..."
              : loading
              ? "Publishing..."
              : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        session={session}
        router={router}
      />

      {/* Main Content - Responsive margins and padding */}
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-7xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 mt-16 lg:mt-0"
          >
            New Report
          </motion.h1>

          <MessageBanner message={message} />

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8"
          >
            {/* Responsive grid layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <ReportForm
                formData={formData}
                setFormData={setFormData}
                mediaUrls={mediaUrls}
                setMediaUrls={setMediaUrls}
                setMessage={setMessage}
                supabase={supabase}
                session={session}
                loading={loading}
                setLoading={setLoading}
                uploadingMedia={uploadingMedia}
                setUploadingMedia={setUploadingMedia}
              />
              {/* Tips section - hidden on mobile, visible on tablet and up */}
              <div className="hidden md:block">
                <TipsSection />
              </div>
            </div>

            {/* Mobile tips section - only visible on mobile */}
            <div className="md:hidden mt-6 pt-6 border-t border-gray-200">
              <TipsSection />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
