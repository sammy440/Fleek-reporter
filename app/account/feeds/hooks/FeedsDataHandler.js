"use client";
import { useState, useEffect } from "react";
import {
  supabaseBrowser,
  useSupabaseClientWithAuth,
} from "../../../_lib/supabaseClient";

// Cache user profiles across renders (user_id -> { name, avatar_url })
const profilesCache = new Map();

// --- FOLLOW SYSTEM HELPERS ---
export const followUser = async (supabase, followerId, followingId) => {
  if (!followerId || !followingId || followerId === followingId) return;
  return supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId });
};

export const unfollowUser = async (supabase, followerId, followingId) => {
  if (!followerId || !followingId || followerId === followingId) return;
  return supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
};

export const isFollowing = async (supabase, followerId, followingId) => {
  if (!followerId || !followingId || followerId === followingId) return false;
  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
};

export const getFollowersCount = async (supabase, userId) => {
  const { count } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("following_id", userId);
  return count || 0;
};

export const getFollowingCount = async (supabase, userId) => {
  const { count } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", userId);
  return count || 0;
};

export const useFeedsData = (session, selectedCategory) => {
  const supabaseAuth = useSupabaseClientWithAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Use auth client if logged in (so RLS sees your NextAuth JWT),
  // otherwise fall back to public client.
  const { supabase: supabaseAuthClient } = useSupabaseClientWithAuth();
  const client = session?.user?.accessToken
    ? supabaseAuthClient
    : supabaseBrowser;

  // ---------- Helpers ----------
  const getProfile = async (userId) => {
    if (!userId) return { name: "Anonymous", avatar_url: null };
    if (profilesCache.has(userId)) return profilesCache.get(userId);

    const { data, error } = await client
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", userId)
      .single();

    if (error || !data) return { name: "Anonymous", avatar_url: null };
    profilesCache.set(userId, data);
    return data;
  };

  // Normalize any report row into the UI shape your components expect
  const normalizeReport = async (row) => {
    const author = await getProfile(row.user_id);

    const comments = await Promise.all(
      (row.report_comments || []).map(async (c) => {
        const p = await getProfile(c.user_id);
        return {
          ...c,
          user_name: p.name,
          user_avatar: p.avatar_url,
        };
      })
    );

    // Hydrate likers with profile info
    const likers = await Promise.all(
      (row.report_likes || []).map(async (l) => {
        const p = await getProfile(l.user_id);
        return {
          user_id: l.user_id,
          user_name: p.name,
          user_avatar: p.avatar_url,
        };
      })
    );

    return {
      ...row,
      like_count: row.report_likes?.length || 0,
      user_has_liked: row.report_likes?.some(
        (l) => l.user_id === session?.user?.id
      ),
      likers,
      comments,
      comment_count: comments.length,
      // Flattened author info for ReportItem.js
      user_name: author.name || "Anonymous",
      user_avatar: author.avatar_url || null,
    };
  };

  // ---------- Initial fetch ----------
  const fetchReports = async () => {
    try {
      setLoading(true);

      let query = client
        .from("reports")
        .select(
          `
          *,
          report_likes (id, user_id),
          report_comments (id, content, user_id, created_at)
        `
        )
        .order("created_at", { ascending: false });

      if (selectedCategory && selectedCategory !== "All") {
        query = query.ilike("category", selectedCategory); // Use case-insensitive matching
      }

      const { data, error } = await query;
      if (error) throw error;

      const normalized = await Promise.all((data || []).map(normalizeReport));
      setReports(normalized);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Like / Comment actions with optimistic updates ----------
  const handleLike = async (reportId) => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    const meProfile = currentUserProfile || (await getProfile(userId));

    // Find the current report
    const currentReport = reports.find((r) => r.id === reportId);
    if (!currentReport) return;

    const wasLiked = currentReport.user_has_liked;

    // Optimistic update - update UI immediately
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== reportId) return report;
        const nextLikeCount = wasLiked
          ? Math.max(0, report.like_count - 1)
          : report.like_count + 1;
        const existingLikers = report.likers || [];
        const nextLikers = wasLiked
          ? existingLikers.filter((l) => l.user_id !== userId)
          : [
              {
                user_id: userId,
                user_name: meProfile.name,
                user_avatar: meProfile.avatar_url,
              },
              ...existingLikers.filter((l) => l.user_id !== userId),
            ];
        return {
          ...report,
          user_has_liked: !wasLiked,
          like_count: nextLikeCount,
          likers: nextLikers,
        };
      })
    );

    try {
      // Always check for existing like first to avoid duplicate key errors
      const { data: existingLike, error: fetchError } = await client
        .from("report_likes")
        .select("id")
        .eq("report_id", reportId)
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no record exists

      if (fetchError) {
        console.error("Error checking existing like:", fetchError);
        // Revert optimistic update
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  user_has_liked: wasLiked,
                  like_count: wasLiked
                    ? report.like_count + 1
                    : Math.max(0, report.like_count - 1),
                }
              : report
          )
        );
        return;
      }

      if (existingLike) {
        // Unlike: delete the existing like
        const { error: deleteError } = await client
          .from("report_likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) {
          console.error("Error deleting like:", deleteError);
          // Revert optimistic update
          setReports((prev) =>
            prev.map((report) =>
              report.id === reportId
                ? {
                    ...report,
                    user_has_liked: wasLiked,
                    like_count: report.like_count + 1,
                    likers: report.likers?.some((l) => l.user_id === userId)
                      ? report.likers
                      : [
                          {
                            user_id: userId,
                            user_name: meProfile.name,
                            user_avatar: meProfile.avatar_url,
                          },
                          ...(report.likers || []),
                        ],
                  }
                : report
            )
          );
        }
      } else {
        // Like: insert new like (only if none exists)
        const { error: insertError } = await client
          .from("report_likes")
          .insert({
            report_id: reportId,
            user_id: userId,
          });

        if (insertError) {
          console.error("Error inserting like:", insertError);
          // Revert optimistic update
          setReports((prev) =>
            prev.map((report) =>
              report.id === reportId
                ? {
                    ...report,
                    user_has_liked: wasLiked,
                    like_count: Math.max(0, report.like_count - 1),
                    likers: (report.likers || []).filter(
                      (l) => l.user_id !== userId
                    ),
                  }
                : report
            )
          );
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert optimistic update on any error
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                user_has_liked: wasLiked,
                like_count: wasLiked
                  ? report.like_count + 1
                  : Math.max(0, report.like_count - 1),
                likers: wasLiked
                  ? [
                      {
                        user_id: userId,
                        user_name: meProfile.name,
                        user_avatar: meProfile.avatar_url,
                      },
                      ...(report.likers || []).filter(
                        (l) => l.user_id !== userId
                      ),
                    ]
                  : (report.likers || []).filter((l) => l.user_id !== userId),
              }
            : report
        )
      );
    }
  };

  const handleCommentSubmit = async (reportId, content) => {
    if (!session?.user?.id || !content?.trim()) return;

    const userId = session.user.id;
    const userProfile = currentUserProfile || {
      name: session.user.name || "Anonymous",
      avatar_url: null,
    };

    // Create optimistic comment
    const optimisticComment = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: content.trim(),
      user_id: userId,
      report_id: reportId,
      created_at: new Date().toISOString(),
      user_name: userProfile.name,
      user_avatar: userProfile.avatar_url,
    };

    // Optimistic update - add comment immediately
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              comments: [...report.comments, optimisticComment],
              comment_count: report.comment_count + 1,
            }
          : report
      )
    );

    try {
      const { data, error } = await client
        .from("report_comments")
        .insert({
          report_id: reportId,
          user_id: userId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error submitting comment:", error);
        // Revert optimistic update
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  comments: report.comments.filter(
                    (c) => c.id !== optimisticComment.id
                  ),
                  comment_count: Math.max(0, report.comment_count - 1),
                }
              : report
          )
        );
        return;
      }

      // Replace optimistic comment with real comment
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                comments: report.comments.map((c) =>
                  c.id === optimisticComment.id
                    ? {
                        ...data,
                        user_name: userProfile.name,
                        user_avatar: userProfile.avatar_url,
                      }
                    : c
                ),
              }
            : report
        )
      );
    } catch (err) {
      console.error("Error submitting comment:", err);
      // Revert optimistic update
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                comments: report.comments.filter(
                  (c) => c.id !== optimisticComment.id
                ),
                comment_count: Math.max(0, report.comment_count - 1),
              }
            : report
        )
      );
    }
  };

  // ---------- Load current user's profile ----------
  useEffect(() => {
    const loadMe = async () => {
      if (!session?.user?.id) return;
      const me = await getProfile(session.user.id);
      setCurrentUserProfile(me);
    };
    loadMe();
  }, [session?.user?.id]);

  // ---------- Realtime subscriptions (simplified to avoid conflicts with optimistic updates) ----------
  useEffect(() => {
    // Only listen for new reports and updates from other users
    const reportsSub = client
      .channel("reports-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        async ({ new: row }) => {
          // Only add if it's not from current user (to avoid duplicates)
          if (row.user_id !== session?.user?.id) {
            const hydrated = await normalizeReport({
              ...row,
              report_likes: [],
              report_comments: [],
            });
            setReports((prev) => [hydrated, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reports" },
        async ({ new: row }) => {
          const author = await getProfile(row.user_id);
          setReports((prev) =>
            prev.map((report) =>
              report.id === row.id
                ? {
                    ...report,
                    ...row,
                    user_name: author.name || report.user_name,
                    user_avatar: author.avatar_url ?? report.user_avatar,
                  }
                : report
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reports" },
        ({ old }) => {
          setReports((prev) => prev.filter((report) => report.id !== old.id));
        }
      )
      .subscribe();

    // Listen for likes from other users only
    const likesSub = client
      .channel("likes-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "report_likes" },
        async ({ new: like }) => {
          // Only update if it's not the current user's like (already handled optimistically)
          if (like.user_id !== session?.user?.id) {
            const p = await getProfile(like.user_id);
            setReports((prev) =>
              prev.map((report) => {
                if (report.id !== like.report_id) return report;
                const already = (report.likers || []).some(
                  (l) => l.user_id === like.user_id
                );
                return {
                  ...report,
                  like_count: report.like_count + 1,
                  likers: already
                    ? report.likers
                    : [
                        {
                          user_id: like.user_id,
                          user_name: p.name,
                          user_avatar: p.avatar_url,
                        },
                        ...(report.likers || []),
                      ],
                };
              })
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "report_likes" },
        ({ old: like }) => {
          // Only update if it's not the current user's unlike (already handled optimistically)
          if (like.user_id !== session?.user?.id) {
            setReports((prev) =>
              prev.map((report) =>
                report.id === like.report_id
                  ? {
                      ...report,
                      like_count: Math.max(0, report.like_count - 1),
                      likers: (report.likers || []).filter(
                        (l) => l.user_id !== like.user_id
                      ),
                    }
                  : report
              )
            );
          }
        }
      )
      .subscribe();

    // Listen for comments from other users
    const commentsSub = client
      .channel("comments-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "report_comments" },
        async ({ new: c }) => {
          // Only add if it's not from current user (already handled optimistically)
          if (c.user_id !== session?.user?.id) {
            const p = await getProfile(c.user_id);
            setReports((prev) =>
              prev.map((report) =>
                report.id === c.report_id
                  ? {
                      ...report,
                      comments: [
                        ...report.comments,
                        {
                          ...c,
                          user_name: p.name,
                          user_avatar: p.avatar_url,
                        },
                      ],
                      comment_count: report.comment_count + 1,
                    }
                  : report
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "report_comments" },
        async ({ new: c }) => {
          const p = await getProfile(c.user_id);
          setReports((prev) =>
            prev.map((report) =>
              report.id === c.report_id
                ? {
                    ...report,
                    comments: report.comments.map((x) =>
                      x.id === c.id
                        ? {
                            ...c,
                            user_name: p.name,
                            user_avatar: p.avatar_url,
                          }
                        : x
                    ),
                  }
                : report
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "report_comments" },
        ({ old: c }) => {
          setReports((prev) =>
            prev.map((report) =>
              report.id === c.report_id
                ? {
                    ...report,
                    comments: report.comments.filter((x) => x.id !== c.id),
                    comment_count: Math.max(0, report.comment_count - 1),
                  }
                : report
            )
          );
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(reportsSub);
      client.removeChannel(likesSub);
      client.removeChannel(commentsSub);
    };
  }, [client, session?.user?.id]);

  // Refetch on category/session changes
  useEffect(() => {
    fetchReports();
  }, [selectedCategory, session?.user?.id]);

  return {
    reports,
    loading,
    currentUserProfile,
    fetchReports,
    handleLike,
    handleCommentSubmit,
  };
};
