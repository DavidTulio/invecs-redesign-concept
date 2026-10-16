import "server-only";

/** Server secrets. Importing this file from browser code fails the build. */
export function serverEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey || !turnstileSecretKey) {
    throw new Error("Missing server environment variables. See .env.example.");
  }
  return { supabaseUrl, supabaseSecretKey, turnstileSecretKey };
}
