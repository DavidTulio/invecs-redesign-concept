import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/server/env";

/**
 * Supabase client with the SECRET key. It bypasses Row Level Security, so it is
 * only used on the server, only after our own checks have passed, and never with
 * anything the visitor controls besides validated values.
 */
export function createAdminClient() {
  const { supabaseUrl, supabaseSecretKey } = serverEnv();
  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
