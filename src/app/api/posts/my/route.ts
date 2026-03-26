import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "../../../lib/supabase";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { refreshStoredImageUrl } from "../../../lib/storageImage";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

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
  // const { page, page_size, from, to } = parsePagination(url);

  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
    // .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const admin = getSupabaseAdmin();
  const rows = data ?? [];

  const posts =
    projectUrl && rows.length > 0
      ? await Promise.all(
          rows.map(async (post) => {
            if (!post.image_url) return post;
            const image_url = await refreshStoredImageUrl(
              admin,
              post.image_url,
              projectUrl,
            );
            return { ...post, image_url };
          }),
        )
      : rows;

  return NextResponse.json({
    posts,
  });
}

