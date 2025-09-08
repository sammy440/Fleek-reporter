"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Import the new components
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import AccountSettings from "./components/AccountSettings";
import RecentActivity from "./components/RecentActivity";
import Sidebar from "../../_components/Sidebar";

import { localDB } from "../../account/chats/lib/localdb.js";
import * as cryptoLib from "../../account/chats/lib/crypto.js";
import { useSupabaseClientWithAuth } from "@/app/_lib/supabaseClient";
import {
  getFollowersCount,
  getFollowingCount,
} from "../feeds/hooks/FeedsDataHandler";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // Use authenticated Supabase client
  const { supabase } = useSupabaseClientWithAuth();

  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    avatar_url: "",
  });
  const [originalData, setOriginalData] = useState({});
  const [reportCount, setReportCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Fetch followers/following counts
  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchCounts = async () => {
      setFollowersCount(await getFollowersCount(supabase, session.user.id));
      setFollowingCount(await getFollowingCount(supabase, session.user.id));
    };
    fetchCounts();
  }, [session?.user?.id, supabase]);

  // Helper function to verify key pair compatibility
  const verifyKeyPairCompatibility = async (publicJwk, privateJwk) => {
    try {
      const testMessage = "key_compatibility_test";
      const { aesKey } = await cryptoLib.deriveConversationKey(
        privateJwk,
        publicJwk,
        null
      );
      const { ivBase64, ciphertextBase64 } = await cryptoLib.encryptWithAesGcm(
        aesKey,
        testMessage
      );
      const decrypted = await cryptoLib.decryptWithAesGcm(
        aesKey,
        ivBase64,
        ciphertextBase64
      );
      return decrypted === testMessage;
    } catch (error) {
      console.error("Key compatibility verification failed:", error);
      return false;
    }
  };

  // --- ENCRYPTION UTILS FOR PRIVATE KEY BACKUP ---
  async function getSessionEncryptionKey() {
    // Use session token as base for key derivation (not perfect, but seamless)
    const token =
      session?.user?.accessToken || session?.accessToken || "fallback";
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(token),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("fleek-reporter-key-backup"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptPrivateKey(privateJwk) {
    const key = await getSessionEncryptionKey();
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const data = enc.encode(JSON.stringify(privateJwk));
    const ct = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return {
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ct)),
    };
  }

  async function decryptPrivateKey(encrypted) {
    const key = await getSessionEncryptionKey();
    const iv = new Uint8Array(encrypted.iv);
    const ct = new Uint8Array(encrypted.ciphertext);
    const pt = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ct
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(pt));
  }

  // --- MAIN KEY BACKUP/RESTORE LOGIC ---
  async function backupPrivateKeyToSupabase(userId, privateJwk) {
    const encrypted = await encryptPrivateKey(privateJwk);
    await supabase
      .from("profiles")
      .update({ encrypted_private_key: encrypted })
      .eq("id", userId);
  }

  async function restorePrivateKeyFromSupabase(userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("encrypted_private_key")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.encrypted_private_key) {
      try {
        return await decryptPrivateKey(profile.encrypted_private_key);
      } catch (e) {
        console.error("Failed to decrypt private key from Supabase", e);
        return null;
      }
    }
    return null;
  }

  // IMPROVED key generation/verification function
  const handleNewUserProfile = async (userId) => {
    try {
      console.log("Ensuring encryption keys for user:", userId);

      // Get current state from both database, local storage, and backup
      const [profileResult, localPrivateKey, restoredPrivateKey] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("public_key_jwk, encrypted_private_key")
            .eq("id", userId)
            .maybeSingle(),
          localDB.privateKeys.get(userId),
          restorePrivateKeyFromSupabase(userId),
        ]);

      const { data: profile, error: fetchError } = profileResult;
      const hasPublicKey = profile?.public_key_jwk;
      const hasPrivateKey = localPrivateKey?.privateJwk;
      const hasBackupKey = !!restoredPrivateKey;

      // Case 1: Both keys exist - verify they're compatible
      if (hasPublicKey && hasPrivateKey) {
        const isCompatible = await verifyKeyPairCompatibility(
          profile.public_key_jwk,
          localPrivateKey.privateJwk
        );
        if (isCompatible) {
          return true;
        } else {
          await Promise.all([
            localDB.privateKeys.delete(userId),
            supabase
              .from("profiles")
              .update({ public_key_jwk: null })
              .eq("id", userId),
          ]);
        }
      }

      // Case 2: Only public key exists - clear it and regenerate both
      if (hasPublicKey && !hasPrivateKey && !hasBackupKey) {
        await supabase
          .from("profiles")
          .update({ public_key_jwk: null })
          .eq("id", userId);
      }

      // Case 3: Only private key exists - clear it
      if (!hasPublicKey && hasPrivateKey && !hasBackupKey) {
        await localDB.privateKeys.delete(userId);
      }

      // Case 4: Backup exists, restore it
      if (hasBackupKey) {
        await localDB.privateKeys.put({
          userId,
          privateJwk: restoredPrivateKey,
        });
        // If public key missing, restore it too
        if (!hasPublicKey) {
          const { publicJwk } = await cryptoLib.generateIdentityKeyPair();
          await supabase
            .from("profiles")
            .update({ public_key_jwk: publicJwk })
            .eq("id", userId);
        }
        return true;
      }

      // Generate new key pair
      const { publicJwk, privateJwk } =
        await cryptoLib.generateIdentityKeyPair();
      const newKeysCompatible = await verifyKeyPairCompatibility(
        publicJwk,
        privateJwk
      );
      if (!newKeysCompatible)
        throw new Error("Generated keys are not compatible");

      // Save both keys atomically and backup private key
      const [updateResult] = await Promise.all([
        supabase
          .from("profiles")
          .upsert({
            id: userId,
            public_key_jwk: publicJwk,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId),
        localDB.privateKeys.put({ userId, privateJwk }),
        backupPrivateKeyToSupabase(userId, privateJwk),
      ]);

      if (updateResult.error) {
        await localDB.privateKeys.delete(userId);
        throw updateResult.error;
      }
      return true;
    } catch (err) {
      console.error("Error in handleNewUserProfile:", err);
      try {
        await Promise.all([
          localDB.privateKeys.delete(userId),
          supabase
            .from("profiles")
            .update({ public_key_jwk: null })
            .eq("id", userId),
        ]);
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }

      setMessage({
        type: "error",
        text: "Failed to generate encryption keys. Please try refreshing the page or logging out and back in.",
      });
      return false;
    }
  };

  // Avatar upload handler (unchanged)
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    try {
      setUploadingAvatar(true);
      setMessage({ type: "", text: "" });

      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile data
      setProfileData((prev) => ({ ...prev, avatar_url: publicUrl }));

      setMessage({ type: "success", text: "Avatar uploaded successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Avatar upload error:", error);
      setMessage({
        type: "error",
        text: "Failed to upload avatar. Please try again.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Load profile data from Supabase
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    loadProfile();
  }, [session, status, router]);

  // Fetch report count
  useEffect(() => {
    const fetchReportCount = async () => {
      if (!session?.user?.id) return;

      try {
        const { count, error } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id);

        if (!error) {
          console.log("Report count:", count);
          setReportCount(count || 0);
        } else {
          console.error("Error fetching report count:", error);
        }
      } catch (error) {
        console.error("Error fetching report count:", error);
      }
    };

    fetchReportCount();
  }, [session?.user?.id, supabase]);

  // Fetch likes count (likes on user's reports)
  useEffect(() => {
    const fetchLikesCount = async () => {
      if (!session?.user?.id) return;

      try {
        // First get all report IDs for this user
        const { data: userReports, error: reportsError } = await supabase
          .from("reports")
          .select("id")
          .eq("user_id", session.user.id);

        if (reportsError) {
          console.error("Error fetching user reports:", reportsError);
          return;
        }

        const reportIds = userReports?.map((report) => report.id) || [];
        console.log("User report IDs:", reportIds);

        if (reportIds.length === 0) {
          setLikesCount(0);
          return;
        }

        // Count likes on user's reports
        const { count, error } = await supabase
          .from("report_likes")
          .select("*", { count: "exact", head: true })
          .in("report_id", reportIds);

        if (!error) {
          console.log("Likes count:", count);
          setLikesCount(count || 0);
        } else {
          console.error("Error fetching likes count:", error);
        }
      } catch (error) {
        console.error("Error fetching likes count:", error);
      }
    };

    fetchLikesCount();
  }, [session?.user?.id, supabase]);

  // Fetch views count - for now just set to 0 or calculate based on your needs
  useEffect(() => {
    const fetchViewsCount = async () => {
      if (!session?.user?.id) return;

      try {
        // If you don't have a views system yet, just set to 0
        // Or if you have a views column in reports, uncomment below:

        const { data: reportsWithViews, error } = await supabase
          .from("reports")
          .select("views")
          .eq("user_id", session.user.id);

        if (!error && reportsWithViews) {
          const totalViews = reportsWithViews.reduce(
            (sum, report) => sum + (report.views || 0),
            0
          );
          setViewsCount(totalViews);
        } else {
          setViewsCount(0);
        }
      } catch (error) {
        console.error("Error fetching views count:", error);
        setViewsCount(0);
      }
    };

    fetchViewsCount();
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    const fetchAllActivities = async () => {
      if (!session?.user?.id) return;

      try {
        const allActivities = [];

        // 1. Fetch Follow Activities
        try {
          const { data: follows, error: followsError } = await supabase
            .from("follows")
            .select(
              `
            created_at, 
            follower_id,
            profiles!follows_follower_id_fkey(name, avatar_url)
          `
            )
            .eq("following_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (follows && !followsError) {
            follows.forEach((follow) => {
              const followerProfile = follow.profiles;
              allActivities.push({
                id: `follow-${follow.follower_id}-${follow.created_at}`,
                type: "follow",
                action: "started following you",
                time: follow.created_at,
                follower: {
                  name: followerProfile?.name || "Someone",
                  avatar_url: followerProfile?.avatar_url,
                  id: follow.follower_id,
                },
              });
            });
          }
        } catch (error) {
          console.error("Error fetching follows:", error);
        }

        // 2. Fetch Report Activities (posted reports)
        try {
          const { data: reports, error: reportsError } = await supabase
            .from("reports")
            .select("id, title, created_at")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(10);

          if (reports && !reportsError) {
            reports.forEach((report) => {
              allActivities.push({
                id: `report-${report.id}`,
                type: "report",
                action: "posted a report",
                time: report.created_at,
                title: report.title,
              });
            });
          }
        } catch (error) {
          console.error("Error fetching reports:", error);
        }

        // 3. Fetch Comment Activities (using report_comments table)
        try {
          // First, get your report IDs
          const { data: myReports } = await supabase
            .from("reports")
            .select("id")
            .eq("user_id", session.user.id);

          const myReportIds = myReports?.map((r) => r.id) || [];

          if (myReportIds.length > 0) {
            // Comments on your reports by others
            const { data: commentsOnMyReports, error: commentsError } =
              await supabase
                .from("report_comments")
                .select(
                  `
              id, 
              content, 
              created_at,
              user_id,
              report_id,
              profiles!report_comments_user_id_fkey(name, avatar_url),
              reports!report_comments_report_id_fkey(title)
            `
                )
                .in("report_id", myReportIds)
                .neq("user_id", session.user.id) // Exclude your own comments
                .order("created_at", { ascending: false })
                .limit(10);

            if (commentsOnMyReports && !commentsError) {
              commentsOnMyReports.forEach((comment) => {
                allActivities.push({
                  id: `comment-${comment.id}`,
                  type: "comment",
                  action: "commented on a report",
                  time: comment.created_at,
                  user: {
                    name: comment.profiles?.name || "Someone",
                    avatar_url: comment.profiles?.avatar_url,
                    id: comment.user_id,
                  },
                  title: comment.reports?.title,
                  preview:
                    comment.content?.substring(0, 50) +
                    (comment.content?.length > 50 ? "..." : ""),
                  target_type: "report",
                });
              });
            }
          }

          // Your comments on other reports
          const { data: myComments, error: myCommentsError } = await supabase
            .from("report_comments")
            .select(
              `
            id, 
            content, 
            created_at,
            report_id,
            reports!report_comments_report_id_fkey(title, user_id)
          `
            )
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (myComments && !myCommentsError) {
            myComments.forEach((comment) => {
              allActivities.push({
                id: `my-comment-${comment.id}`,
                type: "comment",
                action: "commented on a report",
                time: comment.created_at,
                title: comment.reports?.title,
                preview:
                  comment.content?.substring(0, 50) +
                  (comment.content?.length > 50 ? "..." : ""),
                target_type: "report",
              });
            });
          }
        } catch (error) {
          console.error("Error fetching comments:", error);
        }

        // 4. Fetch Like Activities (using report_likes table)
        try {
          // First, get your report IDs
          const { data: myReports } = await supabase
            .from("reports")
            .select("id")
            .eq("user_id", session.user.id);

          const myReportIds = myReports?.map((r) => r.id) || [];

          // Likes on your reports by others
          if (myReportIds.length > 0) {
            const { data: likesOnMyReports, error: likesOnMyReportsError } =
              await supabase
                .from("report_likes")
                .select(
                  `
              id,
              created_at,
              user_id,
              report_id,
              profiles!report_likes_user_id_fkey(name, avatar_url),
              reports!report_likes_report_id_fkey(title)
            `
                )
                .in("report_id", myReportIds)
                .neq("user_id", session.user.id) // Exclude your own likes
                .order("created_at", { ascending: false })
                .limit(10);

            if (likesOnMyReports && !likesOnMyReportsError) {
              likesOnMyReports.forEach((like) => {
                allActivities.push({
                  id: `like-on-my-report-${like.id}`,
                  type: "like",
                  action: "liked a report",
                  time: like.created_at,
                  user: {
                    name: like.profiles?.name || "Someone",
                    avatar_url: like.profiles?.avatar_url,
                    id: like.user_id,
                  },
                  title: like.reports?.title,
                  target_type: "report",
                });
              });
            }
          }

          // Your likes on other reports
          const { data: myLikes, error: myLikesError } = await supabase
            .from("report_likes")
            .select(
              `
            id,
            created_at,
            report_id,
            reports!report_likes_report_id_fkey(title, user_id)
          `
            )
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (myLikes && !myLikesError) {
            myLikes.forEach((like) => {
              // Only include likes on other people's reports
              if (like.reports?.user_id !== session.user.id) {
                allActivities.push({
                  id: `my-like-${like.id}`,
                  type: "like",
                  action: "liked a report",
                  time: like.created_at,
                  title: like.reports?.title,
                  target_type: "report",
                });
              }
            });
          }
        } catch (error) {
          console.error("Error fetching likes:", error);
        }

        // 5. Fetch Profile Update Activities
        try {
          const { data: profileUpdates, error: profileError } = await supabase
            .from("profiles")
            .select("updated_at, created_at")
            .eq("id", session.user.id)
            .single();

          if (profileUpdates && !profileError) {
            const updatedAt = new Date(profileUpdates.updated_at);
            const createdAt = new Date(profileUpdates.created_at);

            // Only add if profile was updated after creation (with at least 1 minute difference)
            if (updatedAt.getTime() - createdAt.getTime() > 60000) {
              allActivities.push({
                id: `profile-update-${profileUpdates.updated_at}`,
                type: "update",
                action: "updated profile",
                time: profileUpdates.updated_at,
                details: "Profile information updated",
              });
            }
          }
        } catch (error) {
          console.error("Error fetching profile updates:", error);
        }

        // Sort all activities by time (most recent first)
        allActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

        console.log("All fetched activities:", allActivities);
        setRecentActivities(allActivities.slice(0, 5));
      } catch (error) {
        console.error("Error fetching activities:", error);
        setRecentActivities([]);
      }
    };

    fetchAllActivities();
  }, [session?.user?.id, supabase]);
  const loadProfile = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (existingProfile) {
        const profileInfo = {
          name: existingProfile.name || session.user.name || "",
          email: existingProfile.email || session.user.email || "",
          bio: existingProfile.bio || "",
          location: existingProfile.location || "",
          website: existingProfile.website || "",
          phone: existingProfile.phone || "",
          avatar_url: existingProfile.avatar_url || session.user.image || "",
        };
        setProfileData(profileInfo);
        setOriginalData(profileInfo);

        // Ensure keys exist after loading profile
        await handleNewUserProfile(session.user.id);
      } else if (!fetchError || fetchError.code === "PGRST116") {
        // Create new profile if it doesn't exist
        const newProfileData = {
          id: session.user.id,
          name: session.user.name || "",
          email: session.user.email || "",
          avatar_url: session.user.image || "",
          bio: "",
          location: "",
          website: "",
          phone: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: insertedProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([newProfileData])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw insertError;
        }

        if (insertedProfile) {
          const profileInfo = {
            name: insertedProfile.name || "",
            email: insertedProfile.email || "",
            bio: insertedProfile.bio || "",
            location: insertedProfile.location || "",
            website: insertedProfile.website || "",
            phone: insertedProfile.phone || "",
            avatar_url: insertedProfile.avatar_url || "",
          };
          setProfileData(profileInfo);
          setOriginalData(profileInfo);

          // Generate keys for new profile
          await handleNewUserProfile(session.user.id);
        }
      } else {
        throw fetchError;
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({
        type: "error",
        text: "Failed to load profile. Please try refreshing the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      setMessage({ type: "error", text: "Authentication error." });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const updateData = {
        id: session.user.id,
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { data: updateResult, error: updateError } = await supabase
        .from("profiles")
        .upsert(updateData)
        .eq("id", session.user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Ensure keys still exist after update (but don't regenerate if they're working)
      await handleNewUserProfile(session.user.id);

      setOriginalData(profileData);
      setIsEditing(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({
        type: "error",
        text: `Failed to save profile: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"
          />
          <p className="text-sm sm:text-base">
            {uploadingAvatar ? "Uploading avatar..." : "Loading..."}
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

      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-bold dark:text-white text-gray-900"
            >
              Profile Settings
            </motion.h1>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all font-medium text-sm sm:text-base ${
                isEditing
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </motion.button>
          </div>

          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                  message.type === "success"
                    ? "bg-green-100 border border-green-400 text-green-700"
                    : message.type === "warning"
                    ? "bg-yellow-100 border border-yellow-400 text-yellow-700"
                    : "bg-red-100 border border-red-400 text-red-700"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <ProfileHeader
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                profileData={profileData}
                session={session}
                uploadingAvatar={uploadingAvatar}
                handleAvatarChange={handleAvatarChange}
                reportCount={reportCount}
                viewsCount={viewsCount}
                likesCount={likesCount}
                followersCount={followersCount}
                followingCount={followingCount}
              />

              <ProfileForm
                profileData={profileData}
                isEditing={isEditing}
                loading={loading}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                handleCancel={handleCancel}
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <AccountSettings />
            <RecentActivity activities={recentActivities} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
