import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "./env";

// Two small bot checks that cost real visitors nothing:
//  1. A signed "form loaded at" stamp. Bots that post instantly, or replay an old
//     form for hours, are caught. The signature stops them from faking the time.
//  2. A one-way hash of the visitor's IP for rate limiting, so the IP itself is never stored.

const MIN_FILL_MS = 3_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

function hmac(purpose: string, value: string) {
  // A separate key per purpose, derived from the server secret.
  const key = createHmac("sha256", serverEnv().turnstileSecretKey).update(purpose).digest();
  return createHmac("sha256", key).update(value).digest("hex");
}

export function createFormStamp(now = Date.now()) {
  return `${now}.${hmac("form-stamp", String(now))}`;
}

export type StampCheck = "ok" | "too-fast" | "expired" | "invalid";

export function checkFormStamp(stamp: unknown, now = Date.now()): StampCheck {
  if (typeof stamp !== "string" || stamp.length > 100) return "invalid";
  const [time, signature] = stamp.split(".");
  if (!time || !signature || !/^\d+$/.test(time)) return "invalid";

  const expected = Buffer.from(hmac("form-stamp", time), "hex");
  const given = Buffer.from(signature, "hex");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return "invalid";

  const age = now - Number(time);
  if (age < MIN_FILL_MS) return "too-fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}

export function hashIp(ip: string) {
  return hmac("ip", ip);
}

/** The visitor's IP as reported by the hosting proxy (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || null;
}
