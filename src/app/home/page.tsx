// "use client";
// import { useSelector } from "react-redux";
// import { RootState } from "../store/app";
// import Navbar from "../components/Navbar";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import Loading from "../components/Loader";
// import axios from "axios";
// import { Loader2 } from "lucide-react";

// type FeedPost = {
//   id: string;
//   content: string;
//   image_url: string | null;
//   user_id: string;
//   created_at: string;
//   author?: {
//     id: string;
//     username: string | null;
//     first_name: string | null;
//     last_name: string | null;
//     avatar_url: string | null;
//   } | null;
//   like_count?: number;
//   is_liked?: boolean;
// };

// type FollowRow = {
//   id: string;
//   username: string | null;
//   first_name: string | null;
//   last_name: string | null;
//   avatar_url: string | null;
// };
// type CommentRow = {
//   id: string;
//   post_id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   user?: {
//     id: string;
//     username: string | null;
//     first_name: string | null;
//     last_name: string | null;
//     avatar_url: string | null;
//   } | null;
// };

// export default function Home() {
//   const profile = useSelector((state: RootState) => state?.user?.userData);
//   const myId = useMemo(() => String(profile?.id ?? ""), [profile?.id]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [posts, setPosts] = useState<FeedPost[]>([]);
//   const [likeBusy, setLikeBusy] = useState<Record<string, boolean>>({});
//   const [liked, setLiked] = useState<Record<string, boolean>>({});
//   const [likesCount, setLikesCount] = useState<Record<string, number>>({});

//   const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
//   const [followBusy, setFollowBusy] = useState<Record<string, boolean>>({});

//   const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
//   const [commentsLoading, setCommentsLoading] = useState(false);
//   const [comments, setComments] = useState<CommentRow[]>([]);
//   const [commentText, setCommentText] = useState("");
//   const [commentBusy, setCommentBusy] = useState(false);
//   const [deleteCommentBusy, setDeleteCommentBusy] = useState<Record<string, boolean>>({});

//   const fetchFollowing = useCallback(async () => {
//     if (!myId) return;
//     try {
//       const res = await axios.get(`/api/users/${myId}/following`);
//       const rows = (res.data?.results ?? []) as FollowRow[];
//       setFollowingIds(new Set(rows.map((r) => r.id)));
//     } catch {
//       // ignore
//     }
//   }, [myId]);

//   const fetchFeed = useCallback(async () => {
//     setError("");
//     setLoading(true);
//     try {
//       const res = await axios.get("/api/feed");
//       const results = (res.data?.results ?? []) as FeedPost[];
//       setPosts(results);
//       setLikesCount(() => {
//         const next: Record<string, number> = {};
//         for (const p of results) next[p.id] = p.like_count ?? 0;
//         return next;
//       });
//       setLiked(() => {
//         const next: Record<string, boolean> = {};
//         for (const p of results) next[p.id] = !!p.is_liked;
//         return next;
//       });
//     } catch (err: unknown) {
//       const msg =
//         axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object"
//           ? (err.response.data as { error?: string }).error
//           : undefined;
//       setError(msg || "Failed to load feed");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchFeed();
//     fetchFollowing();
//   }, [fetchFeed, fetchFollowing]);

//   const openComments = useCallback(async (postId: string) => {
//     setActiveCommentsPostId(postId);
//     setComments([]);
//     setCommentText("");
//     setCommentsLoading(true);
//     try {
//       const res = await axios.get(`/api/posts/${postId}/comments`);
//       setComments((res.data?.results ?? []) as CommentRow[]);
//     } catch {
//       setComments([]);
//     } finally {
//       setCommentsLoading(false);
//     }
//   }, []);

//   const submitComment = useCallback(async () => {
//     const postId = activeCommentsPostId;
//     const t = commentText.trim();
//     if (!postId || !t) return;
//     setCommentBusy(true);
//     try {
//       const res = await axios.post(`/api/posts/${postId}/comments`, { content: t });
//       setComments((prev) => [...prev, res.data as CommentRow]);
//       setCommentText("");
//     } catch {
//       // ignore
//     } finally {
//       setCommentBusy(false);
//     }
//   }, [activeCommentsPostId, commentText]);

//   const removeComment = useCallback(
//     async (postId: string, commentId: string) => {
//       setDeleteCommentBusy((p) => ({ ...p, [commentId]: true }));
//       try {
//         await axios.delete(`/api/posts/${postId}/comments/${commentId}`);
//         setComments((prev) => prev.filter((c) => c.id !== commentId));
//       } finally {
//         setDeleteCommentBusy((p) => ({ ...p, [commentId]: false }));
//       }
//     },
//     [],
//   );

//   const toggleLike = useCallback(async (postId: string) => {
//     if (likeBusy[postId]) return;
//     setLikeBusy((p) => ({ ...p, [postId]: true }));
//     try {
//       if (liked[postId]) {
//         await axios.delete(`/api/posts/${postId}/like`);
//         setLiked((p) => ({ ...p, [postId]: false }));
//         setLikesCount((p) => ({ ...p, [postId]: Math.max(0, (p[postId] ?? 0) - 1) }));
//       } else {
//         await axios.post(`/api/posts/${postId}/like`);
//         setLiked((p) => ({ ...p, [postId]: true }));
//         setLikesCount((p) => ({ ...p, [postId]: (p[postId] ?? 0) + 1 }));
//       }
//     } catch {
//       // ignore
//     } finally {
//       setLikeBusy((p) => ({ ...p, [postId]: false }));
//     }
//   }, [likeBusy, liked]);

//   const toggleFollow = useCallback(
//     async (userId: string) => {
//       if (!myId || userId === myId) return;
//       if (followBusy[userId]) return;
//       setFollowBusy((p) => ({ ...p, [userId]: true }));
//       try {
//         const isFollowing = followingIds.has(userId);
//         if (isFollowing) {
//           await axios.delete(`/api/users/${userId}/follow`);
//           setFollowingIds((prev) => {
//             const next = new Set(prev);
//             next.delete(userId);
//             return next;
//           });
//         } else {
//           await axios.post(`/api/users/${userId}/follow`);
//           setFollowingIds((prev) => new Set(prev).add(userId));
//         }
//         // Refresh feed to reflect personalization
//         fetchFeed();
//       } catch {
//         // ignore
//       } finally {
//         setFollowBusy((p) => ({ ...p, [userId]: false }));
//       }
//     },
//     [fetchFeed, followBusy, followingIds, myId],
//   );

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-[#eef0f8] px-3 sm:px-4 py-5 sm:py-6">
//         <div className="mx-auto w-full max-w-xl md:max-w-2xl space-y-4">
//           <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm">
//             <div className="flex items-center justify-between gap-2">
//               <h1 className="text-sm sm:text-base font-bold text-slate-800">Feed</h1>
//               <button
//                 type="button"
//                 onClick={fetchFeed}
//                 className="min-h-[40px] px-3 rounded-lg bg-slate-100 text-slate-800 text-sm font-medium"
//               >
//                 Refresh
//               </button>
//             </div>
//             {error ? <p className="mt-2 text-xs sm:text-sm text-red-600">{error}</p> : null}
//           </div>

//           {loading ? (
//             <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-6 shadow-sm flex items-center justify-center gap-2 text-slate-600">
//               <Loader2 className="animate-spin" size={20} />
//               Loading feed…
//             </div>
//           ) : posts.length === 0 ? (
//             <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-6 shadow-sm text-center text-slate-500 text-sm">
//               No posts to show yet.
//             </div>
//           ) : (
//             <ul className="space-y-4 list-none p-0 m-0">
//               {posts.map((p) => {
//                 const isMine = myId && p.user_id === myId;
//                 const isFollowing = followingIds.has(p.user_id);
//                 const posterName = isMine
//                   ? "You"
//                   : p.author?.username ||
//                     [p.author?.first_name, p.author?.last_name].filter(Boolean).join(" ") ||
//                     p.user_id;
//                 return (
//                   <li
//                     key={p.id}
//                     className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden"
//                   >
//                     {p.image_url ? (
//                       <img
//                         src={p.image_url}
//                         alt=""
//                         className="w-full max-h-[360px] object-contain bg-black/5"
//                         loading="lazy"
//                       />
//                     ) : null}
//                     <div className="p-4 sm:p-5 space-y-3">
//                       <div className="flex items-center justify-between gap-2">
//                         <p className="text-xs text-slate-500 truncate">
//                           {posterName}
//                         </p>
//                         {!isMine ? (
//                           <button
//                             type="button"
//                             onClick={() => toggleFollow(p.user_id)}
//                             disabled={!!followBusy[p.user_id]}
//                             className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold border ${
//                               isFollowing
//                                 ? "bg-slate-100 text-slate-800 border-slate-200"
//                                 : "bg-indigo-50 text-indigo-800 border-indigo-100"
//                             } disabled:opacity-60`}
//                           >
//                             {followBusy[p.user_id]
//                               ? "…"
//                               : isFollowing
//                                 ? "Following"
//                                 : "Follow"}
//                           </button>
//                         ) : null}
//                       </div>

//                       <p className="text-sm sm:text-base text-slate-800 whitespace-pre-wrap break-words">
//                         {p.content}
//                       </p>

//                       <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
//                         <div className="flex flex-wrap gap-2">
//                           <button
//                             type="button"
//                             onClick={() => toggleLike(p.id)}
//                             disabled={!!likeBusy[p.id]}
//                             className={`min-h-[40px] px-3 rounded-lg text-sm font-medium ${
//                               liked[p.id] ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-800"
//                             } disabled:opacity-60`}
//                           >
//                             ♥ {likesCount[p.id] ?? 0}
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => openComments(p.id)}
//                             className="min-h-[40px] px-3 rounded-lg text-sm font-medium bg-slate-100 text-slate-800"
//                           >
//                             Comments
//                           </button>
//                         </div>
//                         <p className="text-[11px] text-slate-400">
//                           {p.created_at ? new Date(p.created_at).toLocaleString() : ""}
//                         </p>
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//       </div>

//       {/* Comments drawer */}
//       {activeCommentsPostId ? (
//         <div
//           className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center sm:p-4"
//           onClick={() => setActiveCommentsPostId(null)}
//           role="presentation"
//         >
//           <div
//             className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto border border-slate-100"
//             onClick={(e) => e.stopPropagation()}
//             role="dialog"
//             aria-modal="true"
//           >
//             <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center justify-between">
//               <h2 className="font-bold text-slate-800 text-sm sm:text-base">Comments</h2>
//               <button
//                 type="button"
//                 className="min-h-[40px] min-w-[40px] rounded-lg hover:bg-slate-100 text-slate-600 text-lg"
//                 onClick={() => setActiveCommentsPostId(null)}
//                 aria-label="Close"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="p-4 space-y-3">
//               {commentsLoading ? (
//                 <div className="flex items-center justify-center gap-2 text-slate-600 py-6">
//                   <Loader2 className="animate-spin" size={18} />
//                   Loading…
//                 </div>
//               ) : comments.length === 0 ? (
//                 <p className="text-sm text-slate-500 py-4 text-center">No comments yet.</p>
//               ) : (
//                 <ul className="space-y-2 list-none p-0 m-0">
//                   {comments.map((c) => {
//                     const mine = myId && c.user_id === myId;
//                     const displayName = mine
//                       ? "You"
//                       : c.user?.username || c.user?.first_name || c.user_id;
//                     return (
//                       <li key={c.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
//                         <div className="flex items-start justify-between gap-2">
//                           <p className="text-xs text-slate-500 truncate">{displayName}</p>
//                           {mine ? (
//                             <button
//                               type="button"
//                               onClick={() => removeComment(activeCommentsPostId, c.id)}
//                               disabled={!!deleteCommentBusy[c.id]}
//                               className="text-xs font-semibold text-red-600 disabled:opacity-60"
//                             >
//                               {deleteCommentBusy[c.id] ? "…" : "Delete"}
//                             </button>
//                           ) : null}
//                         </div>
//                         <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap break-words">
//                           {c.content}
//                         </p>
//                         <p className="text-[11px] text-slate-400 mt-2">
//                           {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
//                         </p>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               )}

//               <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
//                 <input
//                   value={commentText}
//                   onChange={(e) => setCommentText(e.target.value)}
//                   placeholder="Write a comment…"
//                   className="flex-1 min-h-[44px] border border-slate-200 rounded-lg px-3 text-sm"
//                 />
//                 <button
//                   type="button"
//                   onClick={submitComment}
//                   disabled={commentBusy || !commentText.trim()}
//                   className="min-h-[44px] px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold disabled:opacity-50 sm:shrink-0"
//                 >
//                   {commentBusy ? "…" : "Post"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </>
//   );
// }


"use client";
import { useSelector } from "react-redux";
import { RootState } from "../store/app";
import Navbar from "../components/Navbar";
import { useCallback, useEffect, useMemo, useState } from "react";
import Loading from "../components/Loader";
import axios from "axios";
import { Loader2 } from "lucide-react";

type FeedPost = {
  id: string;
  content: string;
  image_url: string | null;
  user_id: string;
  created_at: string;
  author?: {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  like_count?: number;
  is_liked?: boolean;
};

type FollowRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default function Home() {
  const profile = useSelector((state: RootState) => state?.user?.userData);
  const myId = useMemo(() => String(profile?.id ?? ""), [profile?.id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [likeBusy, setLikeBusy] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});

  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followBusy, setFollowBusy] = useState<Record<string, boolean>>({});

  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [deleteCommentBusy, setDeleteCommentBusy] = useState<Record<string, boolean>>({});

  const fetchFollowing = useCallback(async () => {
    if (!myId) return;
    try {
      const res = await axios.get(`/api/users/${myId}/following`);
      const rows = (res.data?.results ?? []) as FollowRow[];
      setFollowingIds(new Set(rows.map((r) => r.id)));
    } catch {
      // ignore
    }
  }, [myId]);

  const fetchFeed = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.get("/api/feed");
      const results = (res.data?.results ?? []) as FeedPost[];
      setPosts(results);
      setLikesCount(() => {
        const next: Record<string, number> = {};
        for (const p of results) next[p.id] = p.like_count ?? 0;
        return next;
      });
      setLiked(() => {
        const next: Record<string, boolean> = {};
        for (const p of results) next[p.id] = !!p.is_liked;
        return next;
      });
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object"
          ? (err.response.data as { error?: string }).error
          : undefined;
      setError(msg || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    fetchFollowing();
  }, [fetchFeed, fetchFollowing]);

  const openComments = useCallback(async (postId: string) => {
    setActiveCommentsPostId(postId);
    setComments([]);
    setCommentText("");
    setCommentsLoading(true);
    try {
      const res = await axios.get(`/api/posts/${postId}/comments`);
      setComments((res.data?.results ?? []) as CommentRow[]);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const submitComment = useCallback(async () => {
    const postId = activeCommentsPostId;
    const t = commentText.trim();
    if (!postId || !t) return;
    setCommentBusy(true);
    try {
      const res = await axios.post(`/api/posts/${postId}/comments`, { content: t });
      setComments((prev) => [...prev, res.data as CommentRow]);
      setCommentText("");
    } catch {
      // ignore
    } finally {
      setCommentBusy(false);
    }
  }, [activeCommentsPostId, commentText]);

  const removeComment = useCallback(
    async (postId: string, commentId: string) => {
      setDeleteCommentBusy((p) => ({ ...p, [commentId]: true }));
      try {
        await axios.delete(`/api/posts/${postId}/comments/${commentId}`);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } finally {
        setDeleteCommentBusy((p) => ({ ...p, [commentId]: false }));
      }
    },
    [],
  );

  const toggleLike = useCallback(async (postId: string) => {
    if (likeBusy[postId]) return;
    setLikeBusy((p) => ({ ...p, [postId]: true }));
    try {
      if (liked[postId]) {
        await axios.delete(`/api/posts/${postId}/like`);
        setLiked((p) => ({ ...p, [postId]: false }));
        setLikesCount((p) => ({ ...p, [postId]: Math.max(0, (p[postId] ?? 0) - 1) }));
      } else {
        await axios.post(`/api/posts/${postId}/like`);
        setLiked((p) => ({ ...p, [postId]: true }));
        setLikesCount((p) => ({ ...p, [postId]: (p[postId] ?? 0) + 1 }));
      }
    } catch {
      // ignore
    } finally {
      setLikeBusy((p) => ({ ...p, [postId]: false }));
    }
  }, [likeBusy, liked]);

  const toggleFollow = useCallback(
    async (userId: string) => {
      if (!myId || userId === myId) return;
      if (followBusy[userId]) return;
      setFollowBusy((p) => ({ ...p, [userId]: true }));
      try {
        const isFollowing = followingIds.has(userId);
        if (isFollowing) {
          await axios.delete(`/api/users/${userId}/follow`);
          setFollowingIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        } else {
          await axios.post(`/api/users/${userId}/follow`);
          setFollowingIds((prev) => new Set(prev).add(userId));
        }
        fetchFeed();
      } catch {
        // ignore
      } finally {
        setFollowBusy((p) => ({ ...p, [userId]: false }));
      }
    },
    [fetchFeed, followBusy, followingIds, myId],
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-cyan-600",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-amber-600",
      "from-rose-500 to-pink-600",
      "from-indigo-500 to-blue-600",
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>
      {/* Google Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { font-family: 'Sora', sans-serif; }

        .feed-bg {
          background: #f5f4f8;
          background-image:
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(139,92,246,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(99,102,241,0.06) 0%, transparent 60%);
          min-height: 100vh;
        }

        .post-card {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          overflow: hidden;
        }
        .post-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.07);
          transform: translateY(-1px);
        }

        .like-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.18s ease;
          min-height: 40px;
        }
        .like-btn.liked {
          background: linear-gradient(135deg, #f43f5e, #ec4899);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(244,63,94,0.3);
        }
        .like-btn.not-liked {
          background: #f8f8fc;
          color: #52525b;
          border-color: #e4e4f0;
        }
        .like-btn.not-liked:hover {
          background: #fef1f5;
          color: #f43f5e;
          border-color: #fecdd3;
        }
        .like-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .comment-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          background: #f8f8fc;
          color: #52525b;
          border: 1.5px solid #e4e4f0;
          cursor: pointer;
          transition: all 0.18s ease;
          min-height: 40px;
        }
        .comment-btn:hover {
          background: #eff0ff;
          color: #4f46e5;
          border-color: #c7d2fe;
        }

        .follow-btn {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.18s ease;
          min-height: 34px;
          white-space: nowrap;
        }
        .follow-btn.following {
          background: #f4f4f8;
          color: #71717a;
          border-color: #e4e4ec;
        }
        .follow-btn.following:hover {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fecaca;
        }
        .follow-btn.not-following {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
        }
        .follow-btn.not-following:hover {
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
          transform: translateY(-1px);
        }
        .follow-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(99,102,241,0.25);
          min-height: 38px;
        }
        .refresh-btn:hover {
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          transform: translateY(-1px);
        }

        .avatar-ring {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.03em;
        }

        .comment-input {
          flex: 1;
          min-height: 44px;
          padding: 10px 16px;
          border-radius: 100px;
          border: 1.5px solid #e4e4f0;
          font-size: 13px;
          background: #fafafa;
          color: #18181b;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          font-family: 'Sora', sans-serif;
        }
        .comment-input:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.15);
          background: white;
        }
        .comment-input::placeholder { color: #a1a1aa; }

        .post-btn {
          min-height: 44px;
          padding: 0 22px;
          border-radius: 100px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 2px 8px rgba(99,102,241,0.25);
          white-space: nowrap;
          font-family: 'Sora', sans-serif;
        }
        .post-btn:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          transform: translateY(-1px);
        }
        .post-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 15, 20, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @media (min-width: 640px) {
          .drawer-overlay { align-items: center; padding: 16px; }
        }

        .drawer-panel {
          width: 100%;
          max-width: 560px;
          background: white;
          border-radius: 24px 24px 0 0;
          max-height: 92vh;
          overflow-y: auto;
          animation: slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @media (min-width: 640px) {
          .drawer-panel {
            border-radius: 24px;
            max-height: 85vh;
            animation: scaleIn 0.22s cubic-bezier(0.32, 0.72, 0, 1);
          }
        }

        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes pulse-soft { 0%,100% { opacity:1 } 50% { opacity:0.5 } }

        .loading-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #6366f1;
          animation: pulse-soft 1.2s ease infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; background: #8b5cf6; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; background: #a78bfa; }

        .post-image {
          width: 100%;
          max-height: 380px;
          object-fit: cover;
          display: block;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e4e4f0 20%, #e4e4f0 80%, transparent);
          margin: 0;
        }

        .timestamp {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #a1a1aa;
          font-weight: 400;
        }

        .feed-header-card {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px;
          padding: 18px 22px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .feed-title {
          font-size: 18px;
          font-weight: 700;
          color: #18181b;
          letter-spacing: -0.02em;
        }

        .feed-subtitle {
          font-size: 12px;
          color: #a1a1aa;
          font-weight: 400;
          margin-top: 2px;
        }

        .empty-state {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px;
          padding: 48px 24px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .empty-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #eff0ff, #f3e8ff);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
        }

        .comment-item {
          background: #fafafa;
          border: 1px solid #f0f0f6;
          border-radius: 16px;
          padding: 14px 16px;
          transition: background 0.15s ease;
        }
        .comment-item:hover { background: #f5f5fb; }

        .delete-btn {
          font-size: 11px;
          font-weight: 600;
          color: #f87171;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .delete-btn:hover { background: #fef2f2; color: #ef4444; }
        .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          color: #dc2626;
          margin-top: 12px;
        }
      `}</style>

      <Navbar />

      <div className="feed-bg px-3 sm:px-4 py-6 sm:py-8">
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header */}
          <div className="feed-header-card">
            <div>
              <div className="feed-title">Your Feed</div>
              <div className="feed-subtitle">Latest from people you follow</div>
            </div>
            <button type="button" onClick={fetchFeed} className="refresh-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Refresh
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* Loading state */}
          {loading ? (
            // <div style={{
            //   background: "white",
            //   border: "1px solid rgba(0,0,0,0.06)",
            //   borderRadius: 20,
            //   padding: "48px 24px",
            //   display: "flex",
            //   flexDirection: "column",
            //   alignItems: "center",
            //   gap: 16,
            //   boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            // }}>
            //   <div style={{ display: "flex", gap: 8 }}>
            //     <div className="loading-dot" />
            //     <div className="loading-dot" />
            //     <div className="loading-dot" />
            //   </div>
            //   <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 500 }}>Loading your feed…</span>
            // </div>
            <>
              <Loading msg="Loading your feed..." />
            </>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#3f3f46", marginBottom: 6 }}>Nothing here yet</p>
              <p style={{ fontSize: 13, color: "#a1a1aa" }}>Follow some people to see their posts.</p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {posts.map((p) => {
                const isMine = myId && p.user_id === myId;
                const isFollowing = followingIds.has(p.user_id);
                const posterName = isMine
                  ? "You"
                  : p.author?.username ||
                  [p.author?.first_name, p.author?.last_name].filter(Boolean).join(" ") ||
                  p.user_id;
                const initials = getInitials(posterName === "You" ? (profile?.username || "Me") : posterName);
                const avatarColor = getAvatarColor(p.user_id);
                const avatarUrl = p.author?.avatar_url;

                return (
                  <li key={p.id} className="post-card">
                    {/* Post image */}
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt=""
                        className="post-image"
                        loading="lazy"
                      />
                    )}

                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                      {/* Author row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          {/* Avatar */}
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={posterName}
                              className="avatar-ring"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className={`avatar-ring bg-gradient-to-br ${avatarColor}`}
                              style={{ background: undefined }}
                            >
                              <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: avatarColor.includes("violet") ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                                  : avatarColor.includes("blue") ? "linear-gradient(135deg,#3b82f6,#0891b2)"
                                    : avatarColor.includes("emerald") ? "linear-gradient(135deg,#10b981,#0d9488)"
                                      : avatarColor.includes("orange") ? "linear-gradient(135deg,#f97316,#d97706)"
                                        : avatarColor.includes("rose") ? "linear-gradient(135deg,#f43f5e,#ec4899)"
                                          : "linear-gradient(135deg,#6366f1,#3b82f6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: 700, color: "white"
                              }}>
                                {initials}
                              </div>
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#18181b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {posterName}
                            </p>
                          </div>
                        </div>

                        {!isMine && (
                          <button
                            type="button"
                            onClick={() => toggleFollow(p.user_id)}
                            disabled={!!followBusy[p.user_id]}
                            className={`follow-btn ${isFollowing ? "following" : "not-following"}`}
                          >
                            {followBusy[p.user_id] ? "…" : isFollowing ? "Following" : "+ Follow"}
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <p style={{ fontSize: 14, lineHeight: 1.65, color: "#27272a", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {p.content}
                      </p>

                      {/* Divider */}
                      <div className="divider" />

                      {/* Actions row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => toggleLike(p.id)}
                            disabled={!!likeBusy[p.id]}
                            className={`like-btn ${liked[p.id] ? "liked" : "not-liked"}`}
                          >
                            {liked[p.id] ? "♥" : "♡"}
                            <span>{likesCount[p.id] ?? 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openComments(p.id)}
                            className="comment-btn"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Comment
                          </button>
                        </div>
                        <span className="timestamp">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Comments Drawer */}
      {activeCommentsPostId && (
        <div
          className="drawer-overlay"
          onClick={() => setActiveCommentsPostId(null)}
          role="presentation"
        >
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer header */}
            <div style={{
              position: "sticky", top: 0, zIndex: 10,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(12px)",
              padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f6"
            }}>
              {/* Pull handle (mobile) */}
              <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 36, height: 4, borderRadius: 2, background: "#e4e4f0" }} />
              <h2 style={{ fontWeight: 700, fontSize: 15, color: "#18181b", margin: 0, marginTop: 8 }}>
                Comments
              </h2>
              <button
                type="button"
                onClick={() => setActiveCommentsPostId(null)}
                aria-label="Close"
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#f4f4f8", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#71717a", fontSize: 16, fontWeight: 700,
                  transition: "background 0.15s ease", marginTop: 4,
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {commentsLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "32px 0", color: "#a1a1aa", fontSize: 13 }}>
                  <Loader2 className="animate-spin" size={16} style={{ color: "#6366f1" }} />
                  Loading comments…
                </div>
              ) : comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: 13, color: "#a1a1aa", margin: 0 }}>No comments yet. Be the first!</p>
                </div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {comments.map((c) => {
                    const mine = myId && c.user_id === myId;
                    const displayName = mine
                      ? "You"
                      : c.user?.username || c.user?.first_name || c.user_id;
                    const cInitials = getInitials(displayName);
                    const cColor = getAvatarColor(c.user_id);

                    return (
                      <li key={c.id} className="comment-item">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          {/* Mini avatar */}
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, color: "white",
                            background: cColor.includes("violet") ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                              : cColor.includes("blue") ? "linear-gradient(135deg,#3b82f6,#0891b2)"
                                : cColor.includes("emerald") ? "linear-gradient(135deg,#10b981,#0d9488)"
                                  : cColor.includes("orange") ? "linear-gradient(135deg,#f97316,#d97706)"
                                    : cColor.includes("rose") ? "linear-gradient(135deg,#f43f5e,#ec4899)"
                                      : "linear-gradient(135deg,#6366f1,#3b82f6)",
                          }}>
                            {cInitials}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#3f3f46" }}>{displayName}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                <span className="timestamp">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
                                {mine && (
                                  <button
                                    type="button"
                                    onClick={() => removeComment(activeCommentsPostId, c.id)}
                                    disabled={!!deleteCommentBusy[c.id]}
                                    className="delete-btn"
                                  >
                                    {deleteCommentBusy[c.id] ? "…" : "Delete"}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p style={{ fontSize: 13, color: "#3f3f46", margin: "4px 0 0", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                              {c.content}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Comment input */}
              <div style={{
                paddingTop: 12,
                borderTop: "1px solid #f0f0f6",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                  placeholder="Write a comment…"
                  className="comment-input"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={commentBusy || !commentText.trim()}
                  className="post-btn"
                >
                  {commentBusy ? "…" : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}