import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { supabase } from "../../../../lib/supabase";
import { withErrorHandling } from "../../../_utils/withErrorHandling";

const MAX_CONTENT_LENGTH = 280;

type UserLite = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export const GET = withErrorHandling(async (
  _request: Request,
  { params }: { params: Promise<{ post_id: string }> },
) => {
  const { post_id } = await params;

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", post_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data ?? [];
  const userIds = Array.from(new Set(rows.map((c) => c.user_id)));

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, first_name, last_name, avatar_url")
    .in("id", userIds);

  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 400 });

  const userById = new Map<string, UserLite>((users ?? []).map((u) => [u.id, u]));

  return NextResponse.json({
    results: rows.map((c) => ({ ...c, user: userById.get(c.user_id) ?? null })),
  });
});

export const POST = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ post_id: string }> },
) => {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { post_id } = await params;

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, is_active")
    .eq("id", post_id)
    .single();

  if (postError || !post || !post.is_active) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  let content = "";
  try {
    const body = await request.json();
    content = String(body?.content ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `Content must be <= ${MAX_CONTENT_LENGTH} characters` },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        id: randomUUID(),
        post_id,
        user_id: userId,
        content,
        created_at: new Date().toISOString(),
      },
    ])
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to add comment" },
      { status: 400 },
    );
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, username, first_name, last_name, avatar_url")
    .eq("id", userId)
    .single();

  if (userError) return NextResponse.json({ error: userError.message }, { status: 400 });

  return NextResponse.json({ ...data, user }, { status: 201 });
});

