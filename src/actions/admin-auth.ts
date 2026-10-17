"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clientIp, hashIp } from "@/lib/server/form-guard";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string; attempt?: number };

const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

// Same message for every failure, so attackers can't learn which emails exist.
const WRONG = "Email or password is incorrect.";

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const attempt = Date.now();
  const email = String(formData.get("email") ?? "").slice(0, 254);
  const fail = (error: string): LoginState => ({ error, email, attempt });

  const ip = clientIp(await headers());

  // Slow down password guessing: 10 tries per visitor per 15 minutes.
  const { data: allowed, error: limitError } = await createAdminClient().rpc("register_inquiry_attempt", {
    p_ip_hash: hashIp(`login:${ip ?? "unknown"}`),
    p_max_attempts: 10,
    p_window: "15 minutes",
  });
  if (limitError) return fail("Sign-in is unavailable right now. Please try again shortly.");
  if (!allowed) return fail("Too many sign-in attempts. Please wait 15 minutes.");

  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? ""), ip, "login"))) {
    return fail("Please complete the \"I'm human\" check, then try again.");
  }

  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return fail(WRONG);

  const supabase = await createSessionClient({ writeCookies: true });
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return fail(WRONG);

  // A valid account that isn't an admin gets the same answer and no session.
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return fail(WRONG);
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient({ writeCookies: true });
  await supabase.auth.signOut();
  redirect("/admin/login");
}
