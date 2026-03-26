import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "../../../../../lib/supabase";

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ post_id: string; comment_id: string }> },
) {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { post_id, comment_id } = await params;

  const { data: existing, error: findError } = await supabase
    .from("comments")
    .select("id, user_id, post_id")
    .eq("id", comment_id)
    .eq("post_id", post_id)
    .single();

  if (findError || !existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  if (existing.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", comment_id)
    .eq("post_id", post_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
}

