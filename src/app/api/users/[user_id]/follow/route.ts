import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { supabase } from "../../../../lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const headerList = await headers();
  const followerId = headerList.get("x-user-id");
  if (!followerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user_id: followingId } = await params;

  if (!followingId) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }
  if (followingId === followerId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const { error } = await supabase.from("follows").insert([
    {
      id: randomUUID(),
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    if ((error as any)?.code === "23505") {
      return NextResponse.json({ error: "Already following" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Followed" }, { status: 201 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const headerList = await headers();
  const followerId = headerList.get("x-user-id");
  if (!followerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user_id: followingId } = await params;

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Unfollowed" }, { status: 200 });
}

