import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "../../../../lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const headerList = await headers();
  const me = headerList.get("x-user-id");
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user_id } = await params;
  if (user_id !== me) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", me)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const followerIds = Array.from(new Set((data ?? []).map((r) => r.follower_id)));
  if (followerIds.length === 0) return NextResponse.json({ results: [] });

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, first_name, last_name, avatar_url")
    .in("id", followerIds);

  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 400 });
  return NextResponse.json({ results: users ?? [] });
}

