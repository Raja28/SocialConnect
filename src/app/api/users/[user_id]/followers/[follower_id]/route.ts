import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "../../../../../lib/supabase";
import { withErrorHandling } from "../../../../_utils/withErrorHandling";

// Remove a follower (force-unfollow): delete row follower_id -> me
export const DELETE = withErrorHandling(async (
  _request: Request,
  { params }: { params: Promise<{ user_id: string; follower_id: string }> },
) => {
  const headerList = await headers();
  const me = headerList.get("x-user-id");
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user_id, follower_id } = await params;
  if (user_id !== me) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", follower_id)
    .eq("following_id", me);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Follower removed" }, { status: 200 });
});

