import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client that acts as the signed-in user, using their session cookie.
 * Row Level Security applies, so even admin pages can only do what the database
 * allows the admin to do. Create a new one per request.
 *
 * `writeCookies` is only for signing in and out. Everywhere else the client is
 * read-only: the proxy (src/proxy.ts) already refreshes the session cookie on
 * every admin request, and Next.js doesn't allow pages to write cookies.
 */
export async function createSessionClient({ writeCookies = false } = {}) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          if (!writeCookies) return;
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    },
  );
}
