import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";
import { getPostImagesBucketName, normalizeSupabaseUrl } from "./supabaseAdmin";

/** Long-lived signed URLs so <img src> works when the bucket is private. */
const VIEWABLE_IMAGE_TTL_SECS = 60 * 60 * 24 * 365;

/**
 * Parses object path from a Supabase Storage URL (public or signed).
 * Path inside the bucket is everything after `/<bucket>/` (e.g. `posts/<postId>/<file>.jpg`).
 */
export function extractBucketAndPathFromStorageUrl(
  imageUrl: string,
  projectUrl: string,
): { bucket: string; path: string } | null {
  try {
    const u = new URL(imageUrl);
    const origin = normalizeSupabaseUrl(projectUrl);
    if (u.origin !== new URL(origin).origin) return null;

    const m = u.pathname.match(
      /^\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/,
    );
    if (!m) return null;
    return { bucket: m[1], path: decodeURIComponent(m[2]) };
  } catch {
    return null;
  }
}

/** Prefer signed URL so images load even if the bucket is not public. */
export async function getViewableImageUrlAfterUpload(
  admin: SupabaseClient<Database>,
  bucket: string,
  objectPath: string,
): Promise<string> {
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(objectPath, VIEWABLE_IMAGE_TTL_SECS);

  if (!error && data?.signedUrl) return data.signedUrl;

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(objectPath);
  return pub.publicUrl;
}

/** Re-sign an existing stored URL (e.g. after switching from public-only URLs). */
export async function refreshStoredImageUrl(
  admin: SupabaseClient<Database>,
  imageUrl: string | null,
  projectUrl: string,
): Promise<string | null> {
  if (!imageUrl) return null;
  const parsed = extractBucketAndPathFromStorageUrl(imageUrl, projectUrl);
  if (!parsed) return imageUrl;
  const expectedBucket = getPostImagesBucketName();
  if (parsed.bucket !== expectedBucket) return imageUrl;

  const { data, error } = await admin.storage
    .from(expectedBucket)
    .createSignedUrl(parsed.path, VIEWABLE_IMAGE_TTL_SECS);

  if (!error && data?.signedUrl) return data.signedUrl;
  return imageUrl;
}
