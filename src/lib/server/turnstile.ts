import "server-only";
import { serverEnv } from "./env";

export const TURNSTILE_ACTION = "inquiry";

/**
 * Asks Cloudflare whether the CAPTCHA token is genuine. The browser's "passed"
 * signal alone proves nothing, because a bot can fake it.
 * Tokens are single-use and expire after 5 minutes.
 */
export async function verifyTurnstile(token: string, ip: string | null) {
  if (!token || token.length > 2048) return false;

  const body = new URLSearchParams({ secret: serverEnv().turnstileSecretKey, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const result = (await response.json()) as { success: boolean; action?: string; "error-codes"?: string[] };
    if (!result.success) {
      console.warn("Turnstile rejected a token:", result["error-codes"]);
      return false;
    }
    // A token made for a different form on another site is not accepted here.
    return !result.action || result.action === TURNSTILE_ACTION;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false; // fail closed: if we can't verify, we don't accept
  }
}
