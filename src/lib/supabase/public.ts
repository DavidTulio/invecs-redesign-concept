import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/**
 * Cookie-free client for public reads (cars, photos, branches).
 * It acts as the "anon" role, so Row Level Security only lets it read public data.
 * Because it never touches cookies, its results can be cached and shared.
 */
export function createPublicClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Public URL of a file in the car-photos bucket. */
export function carPhotoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/car-photos/${path}`;
}
