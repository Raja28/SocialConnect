import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { supabase } from "../../../../lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ post_id: string }> },
) {
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

  const { error } = await supabase.from("likes").insert([
    {
      id: randomUUID(),
      post_id,
      user_id: userId,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    // Unique constraint violation (already liked)
    if ((error as any)?.code === "23505") {
      return NextResponse.json({ error: "Already liked" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Liked" }, { status: 201 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ post_id: string }> },
) {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { post_id } = await params;

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("post_id", post_id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Unliked" }, { status: 200 });
}

