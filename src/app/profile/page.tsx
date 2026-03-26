// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../store/app";
// import Loading from "../components/Loader";
// import axios from "axios";
// import { setUser } from "../store/userSlice";
// import { Loader2 } from "lucide-react";
// import Navbar from "../components/Navbar";

// const POST_MAX_CHARS = 280;
// const POST_MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// // --- SVG Icons (CheckIcon, MapIcon, etc. remain the same) ---
// const CheckIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" > <polyline points="20 6 9 17 4 12" /> </svg>);
// const MapIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /> <circle cx="12" cy="10" r="3" /> </svg>);
// const LinkIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /> </svg>);
// const PenIcon = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" > <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /> </svg>);

// export default function Profile() {
//   const dispatch = useDispatch();
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [postContent, setPostContent] = useState("");
//   const [postImageFile, setPostImageFile] = useState<File | null>(null);
//   const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
//   const [postSubmitting, setPostSubmitting] = useState(false);
//   const [postError, setPostError] = useState("");
//   const [postSuccess, setPostSuccess] = useState(false);
//   const postFileInputRef = useRef<HTMLInputElement>(null);
//   const [myPosts, setMyPosts] = useState<any[]>([]);

//   const profile = useSelector((state: RootState) => state?.user.userData);

//   // Initialize temp state with all profile fields
//   const [temp, setTemp] = useState({
//     first_name: "",
//     last_name: "",
//     username: "",
//     bio: "",
//     avatar_url: "",
//     location: "",
//     website: ""
//   });

//   const fetchMyPosts = useCallback(async () => {
//     try {
//       if (!profile?.id) return;
//       setLoading(true);
//       setError("");
//       const response = await axios.get("/api/posts/my");
//       setMyPosts(response.data.posts);

//     } catch (error) {
//       console.error(error);
//       setError("Failed to fetch posts");
//     } finally {
//       setLoading(false);
//     }
//   }, [profile?.id]);

//   // Sync temp state when Redux profile loads
//   useEffect(() => {
//     if (profile) {
//       setTemp({
//         first_name: profile.first_name || "",
//         last_name: profile.last_name || "",
//         username: profile.username || "",
//         bio: profile.bio || "",
//         avatar_url: profile.avatar_url || "",
//         location: profile.location || "",
//         website: profile.website || ""
//       });
//     }
//   }, [profile]);

//   useEffect(() => {
//     fetchMyPosts();
//   }, [fetchMyPosts]);

//   useEffect(() => {
//     return () => {
//       if (postImagePreview) URL.revokeObjectURL(postImagePreview);
//     };
//   }, [postImagePreview]);

//   const clearPostImage = () => {
//     if (postImagePreview) URL.revokeObjectURL(postImagePreview);
//     setPostImagePreview(null);
//     setPostImageFile(null);
//     if (postFileInputRef.current) postFileInputRef.current.value = "";
//   };

//   const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     setPostError("");
//     if (!file) {
//       clearPostImage();
//       return;
//     }
//     if (!["image/jpeg", "image/png"].includes(file.type)) {
//       setPostError("Only JPEG or PNG images are allowed.");
//       e.target.value = "";
//       return;
//     }
//     if (file.size > POST_MAX_IMAGE_BYTES) {
//       setPostError("Image must be 2MB or smaller.");
//       e.target.value = "";
//       return;
//     }
//     if (postImagePreview) URL.revokeObjectURL(postImagePreview);
//     setPostImageFile(file);
//     setPostImagePreview(URL.createObjectURL(file));
//   };

//   const handleCreatePost = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setPostError("");
//     const trimmed = postContent.trim();
//     if (!trimmed) {
//       setPostError("Write something to post.");
//       return;
//     }
//     if (trimmed.length > POST_MAX_CHARS) {
//       setPostError(`Post must be ${POST_MAX_CHARS} characters or less.`);
//       return;
//     }

//     setPostSubmitting(true);
//     try {
//       if (postImageFile) {
//         const form = new FormData();
//         form.append("content", trimmed);
//         form.append("image", postImageFile);
//         await axios.post("/api/posts", form);
//       } else {
//         await axios.post("/api/posts", { content: trimmed });
//       }
//       setPostContent("");
//       clearPostImage();
//       setPostSuccess(true);
//       window.setTimeout(() => setPostSuccess(false), 4000);
//       fetchMyPosts();
//     } catch (err: unknown) {
//       const msg =
//         axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object"
//           ? (err.response.data as { error?: string }).error
//           : undefined;
//       setPostError(msg || "Failed to create post");
//     } finally {
//       setPostSubmitting(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     if (name === "bio" && value.length > 160) return;
//     setTemp((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await axios.patch(`/api/user/me`, temp);

//       if (response.status === 200) {
//         dispatch(setUser(response.data.profile));
//         setIsEditing(false);
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cleanUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

//   return (
//     <>
//       <Navbar />
//       {loading && <Loading msg={"Saving Changes..."} />}
//       <div className="profile-root min-h-screen flex flex-col items-center justify-center gap-6 p-4 pb-12 bg-[#eef0f8]">
//         <div className="card w-full max-w-[440px] bg-white rounded-[28px] shadow-[0_8px_40px_rgba(99,102,241,0.12)] relative">
//           {/* Banner */}
//           <div className="banner h-[130px] bg-gradient-to-br from-[#312e81] via-[#6d28d9] to-[#7c3aed] relative overflow-hidden rounded-t-[28px]">
//             <div className="absolute w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.28)_0%,transparent_70%)] -top-[50px] -right-[30px]" />
//           </div>

//           {/* Avatar Section */}
//           <div className="absolute top-[74px] left-[28px] z-10">
//             <div className="w-28 h-28 rounded-full p-1 bg-white ring-4 ring-[#7c3aed] relative">
//               <img
//                 src={temp.avatar_url || `https://ui-avatars.com/api/?name=${temp.first_name}`}
//                 alt="avatar"
//                 className="w-full h-full rounded-full object-cover bg-[#e8eaf6]"
//               />
//             </div>
//           </div>

//           <div className="pt-[68px] px-7 pb-7 rounded-b-[28px]">
//             {!isEditing ? (
//               <>
//                 <h2 className="font-syne text-[22px] font-extrabold text-[#1e1b4b]">
//                   {profile?.first_name} {profile?.last_name}
//                 </h2>
//                 <p className="text-sm text-[#6366f1] font-medium">@{profile?.username}</p>
//                 <p className="text-sm text-slate-500 mt-3.5 italic">{profile?.bio || "No bio yet..."}</p>

//                 <div className="mt-4 flex flex-wrap gap-2">
//                   {profile?.location && (
//                     <span className="inline-flex items-center gap-1.5 bg-[#f5f3ff] px-3 py-1.5 rounded-full text-xs text-[#6d28d9]">
//                       <MapIcon /> {profile.location}
//                     </span>
//                   )}
//                   {profile?.website && (
//                     <a href={profile.website} target="_blank" className="inline-flex items-center gap-1.5 bg-[#f5f3ff] px-3 py-1.5 rounded-full text-xs text-[#6d28d9]">
//                       <LinkIcon /> {cleanUrl(profile.website)}
//                     </a>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-bold rounded-[14px]"
//                 >
//                   Edit Profile
//                 </button>
//               </>
//             ) : (
//               <div className="space-y-4">
//                 <h3 className="font-syne text-lg font-extrabold">{profile?.first_name} {profile?.last_name}</h3>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="flex flex-col gap-1">
//                     <label className="text-[10px] font-bold text-slate-400">First Name</label>
//                     <input name="first_name" value={temp.first_name} onChange={handleChange} className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none" />
//                   </div>
//                   <div className="flex flex-col gap-1">
//                     <label className="text-[10px] font-bold text-slate-400">Last Name</label>
//                     <input name="last_name" value={temp.last_name} onChange={handleChange} className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none" />
//                   </div>
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className="text-[10px] font-bold text-slate-400">Avatar URL</label>
//                   <input name="avatar_url" value={temp.avatar_url} onChange={handleChange} className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none" />
//                 </div>

//                 <div className="flex flex-col gap-1">
//                   <label className="text-[10px] font-bold text-slate-400 flex justify-between">
//                     Bio <span>{temp.bio.length}/160</span>
//                   </label>
//                   <textarea name="bio" value={temp.bio} onChange={handleChange} className="h-20 bg-slate-50 border rounded-xl px-3 py-2 text-sm resize-none outline-none" />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="flex flex-col gap-1">
//                     <label className="text-[10px] font-bold text-slate-400">Location</label>
//                     <input name="location" value={temp.location} onChange={handleChange} className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none" />
//                   </div>
//                   <div className="flex flex-col gap-1">
//                     <label className="text-[10px] font-bold text-slate-400">Website</label>
//                     <input name="website" value={temp.website} onChange={handleChange} className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none" />
//                   </div>
//                 </div>

//                 {error && <p className="text-red-500 text-xs">{error}</p>}

//                 <div className="flex gap-2.5 pt-2">
//                   <div>
//                     <button
//                       onClick={handleSave}
//                       disabled={loading}
//                       className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
//                     >
//                       {loading ? (
//                         <div className="flex items-center gap-2">
//                           <Loader2 className="animate-spin" size={18} />
//                           Saving Changes...
//                         </div>
//                       ) : (
//                         "Save Changes"
//                       )}
//                     </button>
//                   </div>
//                   <button onClick={() => setIsEditing(false)} className="px-5 border rounded-xl text-slate-400 text-sm">
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <form
//           onSubmit={handleCreatePost}
//           className="w-full max-w-[440px] bg-white rounded-[28px] shadow-[0_8px_40px_rgba(99,102,241,0.12)] p-7 space-y-4"
//         >
//           <h3 className="font-syne text-lg font-extrabold text-[#1e1b4b] flex items-center gap-2">
//             <span className="text-[#7c3aed]"><PenIcon /></span>
//             Create a post
//           </h3>
//           <div className="flex flex-col gap-1">
//             <label className="text-[10px] font-bold text-slate-400 flex justify-between">
//               What&apos;s on your mind? <span>{postContent.length}/{POST_MAX_CHARS}</span>
//             </label>
//             <textarea
//               value={postContent}
//               onChange={(e) => {
//                 if (e.target.value.length <= POST_MAX_CHARS) setPostContent(e.target.value);
//               }}
//               placeholder="Share an update…"
//               rows={4}
//               className="bg-slate-50 border rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-200"
//             />
//           </div>
//           <div className="flex flex-col gap-2">
//             <label className="text-[10px] font-bold text-slate-400">Photo (optional, JPEG or PNG, max 2MB)</label>
//             <input
//               ref={postFileInputRef}
//               type="file"
//               accept="image/jpeg,image/png"
//               onChange={handlePostImageChange}
//               className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#f5f3ff] file:text-[#6d28d9]"
//             />
//             {postImagePreview && (
//               <div className="relative rounded-xl overflow-hidden border border-slate-100 max-h-48">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img src={postImagePreview} alt="" className="w-full object-cover max-h-48" />
//                 <button
//                   type="button"
//                   onClick={clearPostImage}
//                   className="absolute top-2 right-2 text-xs bg-white/90 px-2 py-1 rounded-lg text-slate-700 shadow"
//                 >
//                   Remove
//                 </button>
//               </div>
//             )}
//           </div>
//           {postError && <p className="text-red-500 text-xs">{postError}</p>}
//           {postSuccess && (
//             <p className="text-emerald-600 text-xs font-medium">Post published successfully.</p>
//           )}
//           <button
//             type="submit"
//             disabled={postSubmitting}
//             className="w-full py-3.5 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-bold rounded-[14px] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
//           >
//             {postSubmitting ? (
//               <>
//                 <Loader2 className="animate-spin" size={18} />
//                 Posting…
//               </>
//             ) : (
//               "Post"
//             )}
//           </button>
//         </form>
//       </div>
//     </>
//   );
// }

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/app";
import Loading from "../components/Loader";
import axios from "axios";
import { setUser } from "../store/userSlice";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";

const POST_MAX_CHARS = 280;
const POST_MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export type PostRow = {
  id: string;
  content: string;
  image_url: string | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  like_count?: number;
  is_liked?: boolean;
};

export default function Profile() {
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");

  const [postContent, setPostContent] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);

  const [myPosts, setMyPosts] = useState<PostRow[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followTab, setFollowTab] = useState<"followers" | "following">("followers");
  const [followers, setFollowers] = useState<
    { id: string; username: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null }[]
  >([]);
  const [following, setFollowing] = useState<
    { id: string; username: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null }[]
  >([]);
  const [followListLoading, setFollowListLoading] = useState(false);
  const [followActionBusy, setFollowActionBusy] = useState<Record<string, boolean>>({});

  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);

  const postFileInputRef = useRef<HTMLInputElement>(null);

  const profile = useSelector((state: RootState) => state?.user.userData);

  const [temp, setTemp] = useState({
    first_name: "",
    last_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    location: "",
    website: "",
  });

  // 🔹 FETCH POSTS
  const fetchMyPosts = useCallback(async () => {
    try {
      if (!profile?.id) return;

      setPostsLoading(true);
      const res = await axios.get("/api/posts/my");
      setMyPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  }, [profile?.id]);

  const fetchFollowStats = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const userId = String(profile.id);
      const [followersRes, followingRes] = await Promise.all([
        axios.get(`/api/users/${userId}/followers`),
        axios.get(`/api/users/${userId}/following`),
      ]);
      setFollowersCount((followersRes.data?.results ?? []).length);
      setFollowingCount((followingRes.data?.results ?? []).length);
    } catch {
      setFollowersCount(null);
      setFollowingCount(null);
    }
  }, [profile?.id]);

  const fetchFollowLists = useCallback(async () => {
    if (!profile?.id) return;
    setFollowListLoading(true);
    try {
      const userId = String(profile.id);
      const [followersRes, followingRes] = await Promise.all([
        axios.get(`/api/users/${userId}/followers`),
        axios.get(`/api/users/${userId}/following`),
      ]);
      setFollowers(followersRes.data?.results ?? []);
      setFollowing(followingRes.data?.results ?? []);
    } catch {
      setFollowers([]);
      setFollowing([]);
    } finally {
      setFollowListLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile) {
      setTemp({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  useEffect(() => {
    fetchFollowStats();
  }, [fetchFollowStats]);

  useEffect(() => {
    return () => {
      if (postImagePreview) URL.revokeObjectURL(postImagePreview);
    };
  }, [postImagePreview]);

  const clearPostImage = () => {
    if (postImagePreview) URL.revokeObjectURL(postImagePreview);
    setPostImagePreview(null);
    setPostImageFile(null);
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPostError("Only JPEG/PNG allowed");
      return;
    }

    if (file.size > POST_MAX_IMAGE_BYTES) {
      setPostError("Max 2MB image");
      return;
    }

    setPostImageFile(file);
    setPostImagePreview(URL.createObjectURL(file));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError("");
    const trimmed = postContent.trim();
    if (!trimmed) {
      setPostError("Write something to post.");
      return;
    }
    if (trimmed.length > POST_MAX_CHARS) {
      setPostError(`Max ${POST_MAX_CHARS} characters.`);
      return;
    }

    setPostSubmitting(true);

    try {
      if (postImageFile) {
        const form = new FormData();
        form.append("content", trimmed);
        form.append("image", postImageFile);
        await axios.post("/api/posts", form);
      } else {
        await axios.post("/api/posts", { content: trimmed });
      }

      setPostContent("");
      clearPostImage();
      if (postFileInputRef.current) postFileInputRef.current.value = "";
      setPostSuccess(true);
      window.setTimeout(() => setPostSuccess(false), 4000);
      fetchMyPosts();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object"
          ? (err.response.data as { error?: string }).error
          : undefined;
      setPostError(msg || "Failed to post");
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "bio" && value.length > 160) return;
    setTemp((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSavingProfile(true);
    setError("");
    try {
      const res = await axios.patch(`/api/user/me`, temp);
      dispatch(setUser(res.data.profile));
      setIsEditing(false);
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object"
          ? (err.response.data as { error?: string }).error
          : undefined;
      setError(msg || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const cleanUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <>
      <Navbar />
      {savingProfile && <Loading msg="Saving changes..." />}

      <div className="flex flex-col items-center gap-5 sm:gap-6 px-3 sm:px-4 py-4 sm:py-6 bg-[#eef0f8] min-h-screen w-full max-w-full">

        {/* PROFILE CARD */}
        <div className="w-full max-w-xl md:max-w-2xl bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100/80">
          {!isEditing ? (
            <>
              <div className="flex items-center gap-3">
                <img
                  src={temp.avatar_url || `https://ui-avatars.com/api/?name=${temp.first_name || "User"}`}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover bg-slate-100 border border-slate-200"
                />
                <div className="min-w-0">
                  <h2 className="font-bold text-lg text-slate-900 truncate">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-sm text-indigo-600 truncate">@{profile?.username}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFollowTab("followers");
                    setFollowModalOpen(true);
                    fetchFollowLists();
                  }}
                  className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs text-slate-700 hover:bg-slate-100"
                >
                  <strong className="font-semibold">{followersCount ?? "—"}</strong> Followers
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFollowTab("following");
                    setFollowModalOpen(true);
                    fetchFollowLists();
                  }}
                  className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs text-slate-700 hover:bg-slate-100"
                >
                  <strong className="font-semibold">{followingCount ?? "—"}</strong> Following
                </button>
              </div>

              <p className="text-sm text-slate-600 mt-3 italic">
                {profile?.bio || "No bio yet..."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {profile?.location ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#f5f3ff] px-3 py-1.5 rounded-full text-xs text-[#6d28d9]">
                    📍 {profile.location}
                  </span>
                ) : null}
                {profile?.website ? (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#f5f3ff] px-3 py-1.5 rounded-full text-xs text-[#6d28d9]"
                  >
                    🔗 {cleanUrl(profile.website)}
                  </a>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-4 w-full min-h-[44px] bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold active:scale-[0.99] transition-transform"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">First Name</label>
                  <input
                    name="first_name"
                    value={temp.first_name}
                    onChange={handleProfileChange}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Last Name</label>
                  <input
                    name="last_name"
                    value={temp.last_name}
                    onChange={handleProfileChange}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Username</label>
                  <input
                    name="username"
                    value={temp.username}
                    onChange={handleProfileChange}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Avatar URL</label>
                  <input
                    name="avatar_url"
                    value={temp.avatar_url}
                    onChange={handleProfileChange}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 flex justify-between">
                  Bio <span>{temp.bio.length}/160</span>
                </label>
                <textarea
                  name="bio"
                  value={temp.bio}
                  onChange={handleProfileChange}
                  className="h-20 bg-slate-50 border rounded-xl px-3 py-2 text-sm resize-none outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Location</label>
                  <input
                    name="location"
                    value={temp.location}
                    onChange={handleProfileChange}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Website</label>
                  <input
                    name="website"
                    value={temp.website}
                    onChange={handleProfileChange}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              {error ? <p className="text-red-500 text-xs">{error}</p> : null}

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="min-h-[44px] px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={savingProfile}
                  className="min-h-[44px] px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {savingProfile ? <Loader2 className="animate-spin" size={18} /> : null}
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CREATE POST */}
        <form
          onSubmit={handleCreatePost}
          className="w-full max-w-xl md:max-w-2xl bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100/80 space-y-3"
        >
          <div className="flex justify-between items-baseline gap-2">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">New post</h3>
            <span className="text-xs text-slate-400 tabular-nums">
              {postContent.length}/{POST_MAX_CHARS}
            </span>
          </div>
          <textarea
            value={postContent}
            onChange={(e) => {
              if (e.target.value.length <= POST_MAX_CHARS) setPostContent(e.target.value);
            }}
            placeholder="Write something..."
            rows={4}
            className="w-full border border-slate-200 rounded-lg p-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <input
            ref={postFileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handlePostImageChange}
            className="w-full text-xs sm:text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
          />
          {postError && <p className="text-red-500 text-xs">{postError}</p>}
          {postSuccess && (
            <p className="text-emerald-600 text-xs font-medium">Posted successfully.</p>
          )}
          {postImagePreview && (
            <img
              src={postImagePreview}
              alt=""
              className="w-full max-h-56 object-cover rounded-lg border border-slate-100"
            />
          )}
          <button
            type="submit"
            disabled={postSubmitting}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {postSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Posting…
              </>
            ) : (
              "Post"
            )}
          </button>
        </form>

        {/* MY POSTS */}
        <div className="w-full max-w-xl md:max-w-2xl bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100/80 pb-6">
          <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 text-sm sm:text-base">My posts</h3>

          {postsLoading && (
            <div className="flex items-center justify-center gap-2 text-slate-500 py-10 text-sm">
              <Loader2 className="animate-spin" size={20} />
              Loading…
            </div>
          )}

          {!postsLoading && myPosts.length === 0 && (
            <p className="text-center text-slate-400 py-10 text-sm">No posts yet.</p>
          )}

          {!postsLoading && myPosts.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 list-none p-0 m-0">
              {myPosts.map((post) => (
                <li key={post.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="w-full text-left rounded-xl border border-slate-100 overflow-hidden bg-slate-50/80 hover:ring-2 hover:ring-indigo-200 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt=""
                        className="w-full aspect-[4/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] flex items-center p-3 bg-gradient-to-br from-slate-100 to-slate-50">
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-4">
                          {post.content}
                        </p>
                      </div>
                    )}
                    {post.image_url && (
                      <p className="px-2 py-2 text-xs text-slate-600 line-clamp-2 border-t border-slate-100 bg-white">
                        {post.content}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedPost && (
          <PostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onPostsChanged={fetchMyPosts}
          />
        )}

        {followModalOpen && (
          <div
            className="fixed inset-0 z-[120] bg-black/50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setFollowModalOpen(false)}
            role="presentation"
          >
            <div
              className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto border border-slate-100"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFollowTab("followers")}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold border ${
                      followTab === "followers"
                        ? "bg-indigo-50 text-indigo-800 border-indigo-100"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Followers
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowTab("following")}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold border ${
                      followTab === "following"
                        ? "bg-indigo-50 text-indigo-800 border-indigo-100"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Following
                  </button>
                </div>
                <button
                  type="button"
                  className="min-h-[40px] min-w-[40px] rounded-lg hover:bg-slate-100 text-slate-600 text-lg"
                  onClick={() => setFollowModalOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="p-4 space-y-3">
                {followListLoading ? (
                  <div className="flex items-center justify-center gap-2 text-slate-600 py-6">
                    <Loader2 className="animate-spin" size={18} />
                    Loading…
                  </div>
                ) : (
                  <>
                    {followTab === "followers" ? (
                      followers.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-6">No followers yet.</p>
                      ) : (
                        <ul className="space-y-2 list-none p-0 m-0">
                          {followers.map((u) => {
                            const name =
                              u.username ||
                              [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                              u.id;
                            return (
                              <li
                                key={u.id}
                                className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50/60"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`}
                                    alt=""
                                    className="w-9 h-9 rounded-full object-cover bg-slate-100 border border-slate-200"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                                    {u.username ? (
                                      <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                                    ) : null}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  disabled={!!followActionBusy[u.id]}
                                  onClick={async () => {
                                    if (!profile?.id) return;
                                    setFollowActionBusy((p) => ({ ...p, [u.id]: true }));
                                    try {
                                      await axios.delete(`/api/users/${profile.id}/followers/${u.id}`);
                                      await fetchFollowLists();
                                      await fetchFollowStats();
                                    } finally {
                                      setFollowActionBusy((p) => ({ ...p, [u.id]: false }));
                                    }
                                  }}
                                  className="min-h-[40px] px-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-100 disabled:opacity-60"
                                >
                                  {followActionBusy[u.id] ? "…" : "Remove"}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )
                    ) : following.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6">Not following anyone yet.</p>
                    ) : (
                      <ul className="space-y-2 list-none p-0 m-0">
                        {following.map((u) => {
                          const name =
                            u.username ||
                            [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                            u.id;
                          return (
                            <li
                              key={u.id}
                              className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50/60"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover bg-slate-100 border border-slate-200"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                                  {u.username ? (
                                    <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                                  ) : null}
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={!!followActionBusy[u.id]}
                                onClick={async () => {
                                  setFollowActionBusy((p) => ({ ...p, [u.id]: true }));
                                  try {
                                    await axios.delete(`/api/users/${u.id}/follow`);
                                    await fetchFollowLists();
                                    await fetchFollowStats();
                                  } finally {
                                    setFollowActionBusy((p) => ({ ...p, [u.id]: false }));
                                  }
                                }}
                                className="min-h-[40px] px-3 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 disabled:opacity-60"
                              >
                                {followActionBusy[u.id] ? "…" : "Unfollow"}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

type PostModalProps = {
  post: PostRow;
  onClose: () => void;
  onPostsChanged: () => void;
};

function PostModal({ post, onClose, onPostsChanged }: PostModalProps) {
  const [liked, setLiked] = useState(!!post.is_liked);
  const [likes, setLikes] = useState(post.like_count ?? 0);
  const [comment, setComment] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bannerError, setBannerError] = useState("");

  const editFileRef = useRef<HTMLInputElement>(null);

  // Reset when opening a different post (by id).
  useEffect(() => {
    setEditContent(post.content);
    setEditFile(null);
    setEditPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setRemoveImage(false);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setBannerError("");
    setLiked(!!post.is_liked);
    setLikes(post.like_count ?? 0);
  }, [post.id]);

  useEffect(() => {
    return () => {
      if (editPreview) URL.revokeObjectURL(editPreview);
    };
  }, [editPreview]);

  const clearEditFile = () => {
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditPreview(null);
    setEditFile(null);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const onEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setBannerError("");
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setBannerError("Only JPEG or PNG images.");
      e.target.value = "";
      return;
    }
    if (f.size > POST_MAX_IMAGE_BYTES) {
      setBannerError("Image must be 2MB or smaller.");
      e.target.value = "";
      return;
    }
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditFile(f);
    setEditPreview(URL.createObjectURL(f));
    setRemoveImage(false);
  };

  const handleLikeToggle = async () => {
    try {
      if (liked) {
        await axios.delete(`/api/posts/${post.id}/like`);
        setLiked(false);
        setLikes((n) => Math.max(0, n - 1));
      } else {
        await axios.post(`/api/posts/${post.id}/like`);
        setLiked(true);
        setLikes((n) => n + 1);
      }
    } catch {
      /* ignore */
    }
  };

  const handleComment = async () => {
    const t = comment.trim();
    if (!t) return;
    setCommentBusy(true);
    try {
      await axios.post(`/api/posts/${post.id}/comments`, { content: t });
      setComment("");
    } catch {
      setBannerError("Could not add comment.");
    } finally {
      setCommentBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    setBannerError("");
    const trimmed = editContent.trim();
    if (!trimmed) {
      setBannerError("Content is required.");
      return;
    }
    if (trimmed.length > POST_MAX_CHARS) {
      setBannerError(`Max ${POST_MAX_CHARS} characters.`);
      return;
    }

    setEditBusy(true);
    try {
      if (editFile) {
        const fd = new FormData();
        fd.append("content", trimmed);
        fd.append("image", editFile);
        await axios.patch(`/api/posts/${post.id}`, fd);
      } else {
        const body: { content: string; remove_image?: boolean } = { content: trimmed };
        if (removeImage && post.image_url) body.remove_image = true;
        await axios.patch(`/api/posts/${post.id}`, body);
      }
      onPostsChanged();
      onClose();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object"
          ? (err.response.data as { error?: string }).error
          : undefined;
      setBannerError(msg || "Failed to update post.");
    } finally {
      setEditBusy(false);
    }
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    setBannerError("");
    try {
      await axios.delete(`/api/posts/${post.id}`);
      onPostsChanged();
      onClose();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data === "object"
          ? (err.response.data as { error?: string }).error
          : undefined;
      setBannerError(msg || "Failed to delete post.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleteBusy(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
    clearEditFile();
    setRemoveImage(false);
    setBannerError("");
  };

  const showImage =
    (post.image_url && !removeImage && !editPreview) || editPreview;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 bg-black/60 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-auto sm:min-w-[min(100%,24rem)] md:min-w-[28rem] max-w-xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
          <h2 id="post-modal-title" className="text-sm sm:text-base font-bold text-slate-800 truncate pr-2">
            Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 min-h-[40px] min-w-[40px] rounded-lg text-slate-500 hover:bg-slate-100 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {showImage ? (
          <div className="relative w-full bg-slate-900/5">
            <img
              src={editPreview || post.image_url || ""}
              alt=""
              className="w-full max-h-[min(50vh,320px)] sm:max-h-[360px] object-contain bg-black/5"
            />
            {isEditing && post.image_url && !editFile && (
              <label className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm bg-white border-t border-slate-100">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(e) => setRemoveImage(e.target.checked)}
                />
                Remove current photo
              </label>
            )}
          </div>
        ) : (
          <div className="px-4 py-6 bg-slate-50 text-sm text-slate-600 min-h-[120px]">
            Text-only post
          </div>
        )}

        <div className="p-4 space-y-4 flex-1">
          {bannerError && (
            <p className="text-red-600 text-xs sm:text-sm rounded-lg bg-red-50 px-3 py-2">{bannerError}</p>
          )}

          {isEditing ? (
            <>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Edit caption</span>
                <span className="tabular-nums">{editContent.length}/{POST_MAX_CHARS}</span>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => {
                  if (e.target.value.length <= POST_MAX_CHARS) setEditContent(e.target.value);
                }}
                rows={4}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">New photo (optional)</label>
                <input
                  ref={editFileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={onEditFileChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-2 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={editBusy}
                  className="w-full sm:w-auto min-h-[44px] px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editBusy}
                  className="w-full sm:w-auto min-h-[44px] px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {editBusy ? <Loader2 className="animate-spin" size={18} /> : null}
                  Save changes
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm sm:text-base text-slate-800 whitespace-pre-wrap break-words">{post.content}</p>

              <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setBannerError("");
                  }}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-indigo-50 text-indigo-800 text-sm font-semibold border border-indigo-100"
                >
                  <Pencil size={16} aria-hidden />
                  Edit post
                </button>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-red-50 text-red-700 text-sm font-semibold border border-red-100"
                  >
                    <Trash2 size={16} aria-hidden />
                    Delete
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto p-3 rounded-xl bg-red-50/80 border border-red-100">
                    <p className="text-xs text-red-800 sm:self-center sm:mr-2">Delete this post permanently?</p>
                    <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:flex-initial">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteBusy}
                        className="min-h-[40px] px-3 rounded-lg border border-slate-200 bg-white text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteBusy}
                        className="min-h-[40px] px-3 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {deleteBusy ? <Loader2 className="animate-spin" size={16} /> : null}
                        Confirm delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLikeToggle}
                  className={`min-h-[40px] px-3 rounded-lg text-sm font-medium ${
                    liked ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  ♥ {likes}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment…"
                  className="flex-1 min-h-[44px] border border-slate-200 rounded-lg px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={handleComment}
                  disabled={commentBusy || !comment.trim()}
                  className="min-h-[44px] px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold disabled:opacity-50 sm:shrink-0"
                >
                  {commentBusy ? "…" : "Comment"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}