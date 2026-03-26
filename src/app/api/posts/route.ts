import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { supabase } from "../../lib/supabase";
import { getPostImagesBucketName, getSupabaseAdmin } from "../../lib/supabaseAdmin";
import { getViewableImageUrlAfterUpload } from "../../lib/storageImage";
import { withErrorHandling } from "../_utils/withErrorHandling";

const MAX_CONTENT_LENGTH = 280;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
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

async function uploadPostImage(postId: string, image: File) {
  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    return { error: "Only JPEG and PNG images are supported" as const };
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return { error: "Image too large (max 2MB)" as const };
  }

  const bucket = getPostImagesBucketName();
  const ext = image.type === "image/png" ? "png" : "jpg";
  const path = `posts/${postId}/${randomUUID()}.${ext}`;

  const supabaseAdmin = getSupabaseAdmin();
  const arrayBuffer = await image.arrayBuffer();
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: image.type,
      upsert: false,
    });

  if (error || !data) return { error: error?.message ?? "Upload failed" };

  const publicUrl = await getViewableImageUrlAfterUpload(
    supabaseAdmin,
    bucket,
    data.path,
  );
  return { publicUrl };
}

export const GET = withErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const { page, page_size, from, to } = parsePagination(url);

  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    page,
    page_size,
    total: count ?? null,
    results: data ?? [],
  });
});

export const POST = withErrorHandling(async (request: Request) => {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let content = "";
  let image: File | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      content = String(form.get("content") ?? "").trim();
      const img = form.get("image");
      image = img instanceof File ? img : null;
    } else {
      const body = await request.json();
      content = String(body?.content ?? "").trim();
    }
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

  const postId = randomUUID();
  const now = new Date().toISOString();

  const { data: created, error: createError } = await supabase
    .from("posts")
    .insert([
      {
        id: postId,
        content,
        user_id: userId,
        image_url: null,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("*")
    .single();

  if (createError || !created) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create post" },
      { status: 400 },
    );
  }

  if (image) {
    const upload = await uploadPostImage(postId, image);
    if ("error" in upload) {
      await supabase.from("posts").delete().eq("id", postId);
      return NextResponse.json({ error: upload.error }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("posts")
      .update({ image_url: upload.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", postId)
      .select("*")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: updateError?.message ?? "Failed to attach image" },
        { status: 400 },
      );
    }

    return NextResponse.json(updated, { status: 201 });
  }

  return NextResponse.json(created, { status: 201 });
});

