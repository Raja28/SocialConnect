import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "../../lib/supabase";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

type AuthorLite = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

function parsePagination(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSizeRaw =
    Number(url.searchParams.get("page_size") ?? `${DEFAULT_PAGE_SIZE}`) ||
    DEFAULT_PAGE_SIZE;
  const page_size = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSizeRaw));
  const from = (page - 1) * page_size;
  const to = from + page_size - 1;
  return { page, page_size, from, to };
}

export async function GET(request: Request) {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const { page, page_size, from, to } = parsePagination(url);

  const { data: followingRows, error: followingError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (followingError) {
    return NextResponse.json({ error: followingError.message }, { status: 400 });
  }

  const followingIds = (followingRows ?? []).map((r) => r.following_id);
  const authorIds =
    followingIds.length > 0 ? Array.from(new Set([userId, ...followingIds])) : null;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (authorIds) query = query.in("user_id", authorIds);

  const { data, error, count } = await query.range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data ?? [];
  const postIds = rows.map((p) => p.id);
  const userIds = Array.from(new Set(rows.map((p) => p.user_id)));

  const [{ data: users, error: usersError }, { data: likes, error: likesError }] =
    await Promise.all([
      userIds.length
        ? supabase
            .from("users")
            .select("id, username, first_name, last_name, avatar_url")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      postIds.length
        ? supabase.from("likes").select("post_id, user_id").in("post_id", postIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 400 });
  if (likesError) return NextResponse.json({ error: likesError.message }, { status: 400 });

  const authorById = new Map<string, AuthorLite>(
    ((users ?? []) as AuthorLite[]).map((u) => [u.id, u]),
  );

  const likeCountByPost = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const l of likes ?? []) {
    likeCountByPost.set(l.post_id, (likeCountByPost.get(l.post_id) ?? 0) + 1);
    if (l.user_id === userId) likedByMe.add(l.post_id);
  }

  const results = rows.map((p) => ({
    ...p,
    author: authorById.get(p.user_id) ?? null,
    like_count: likeCountByPost.get(p.id) ?? 0,
    is_liked: likedByMe.has(p.id),
  }));

  return NextResponse.json({
    page,
    page_size,
    total: count ?? null,
    results,
  });
}

