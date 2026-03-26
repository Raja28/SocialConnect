import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

let cached: SupabaseClient<Database> | null = null;

export function normalizeSupabaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

/** Bucket id must match the Storage bucket name exactly (case-sensitive). */
export function getPostImagesBucketName() {
  return (process.env.SUPABASE_POST_IMAGES_BUCKET || "post-images").trim();
}

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (cached) return cached;

  const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrlRaw) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");

  const supabaseUrl = normalizeSupabaseUrl(supabaseUrlRaw);
  cached = createClient<Database>(supabaseUrl, serviceRoleKey);
  return cached;
}

