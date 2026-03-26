import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { supabase } from "../../../lib/supabase";
import { getPostImagesBucketName, getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { getViewableImageUrlAfterUpload } from "../../../lib/storageImage";
import { withErrorHandling } from "../../_utils/withErrorHandling";

const MAX_CONTENT_LENGTH = 280;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);

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

export const GET = withErrorHandling(async (
  _request: Request,
  { params }: { params: Promise<{ post_id: string }> },
) => {
  const { post_id } = await params;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", post_id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(data);
});

export const PATCH = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ post_id: string }> },
) => {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { post_id } = await params;

  const { data: existing, error: findError } = await supabase
    .from("posts")
    .select("id, user_id, is_active")
    .eq("id", post_id)
    .single();

  if (findError || !existing || !existing.is_active) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (existing.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let content: string | undefined = undefined;
  let image: File | null = null;
  let removeImage = false;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      if (form.has("content")) content = String(form.get("content") ?? "").trim();
      const img = form.get("image");
      image = img instanceof File && img.size > 0 ? img : null;
      const rm = form.get("remove_image");
      removeImage = rm === "true" || rm === "1";
    } else {
      const body = await request.json();
      if (body?.content !== undefined) content = String(body.content ?? "").trim();
      if (body?.remove_image === true) removeImage = true;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const hasChanges =
    content !== undefined || image !== null || removeImage;

  if (!hasChanges) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  if (content !== undefined) {
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be <= ${MAX_CONTENT_LENGTH} characters` },
        { status: 400 },
      );
    }
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (content !== undefined) updatePayload.content = content;

  if (image) {
    const upload = await uploadPostImage(post_id, image);
    if ("error" in upload) {
      return NextResponse.json({ error: upload.error }, { status: 400 });
    }
    updatePayload.image_url = upload.publicUrl;
  } else if (removeImage) {
    updatePayload.image_url = null;
  }

  const { data: updated, error: updateError } = await supabase
    .from("posts")
    .update(updatePayload)
    .eq("id", post_id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Failed to update post" },
      { status: 400 },
    );
  }

  return NextResponse.json(updated);
});

export const PUT = withErrorHandling(
  async (request: Request, ctx: { params: Promise<{ post_id: string }> }) =>
    PATCH(request, ctx),
);

export const DELETE = withErrorHandling(async (
  _request: Request,
  { params }: { params: Promise<{ post_id: string }> },
) => {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { post_id } = await params;

  const { data: existing, error: findError } = await supabase
    .from("posts")
    .select("id, user_id, is_active")
    .eq("id", post_id)
    .single();

  if (findError || !existing || !existing.is_active) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (existing.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: delError } = await supabase
    .from("posts")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", post_id);

  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Post deleted" }, { status: 200 });
});

