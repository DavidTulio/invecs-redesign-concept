import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * The one gate for everything in /admin. Call it at the top of every admin page
 * and every admin Server Action. Hiding a button is not security; this is.
 *
 * It verifies the login token, then checks the user is listed in public.admins.
 * Anyone else is sent to the login page.
 */
export async function requireAdmin() {
  // Always check per request, never while Next.js pre-renders a page shell.
  await connection();
  const supabase = await createSessionClient();

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) {
    if (error) console.warn("Admin session rejected:", error.message);
    redirect("/admin/login");
  }

  // RLS only lets a user read their own row here, so this can't be spoofed.
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-admin");
  }

  return { supabase, userId, email: (data.claims.email as string | undefined) ?? "" };
}
