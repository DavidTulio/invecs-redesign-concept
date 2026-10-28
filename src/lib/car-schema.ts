import { z } from "@/lib/zod";
import { BODY_TYPES, FUELS, TRANSMISSIONS } from "./types";

export const CAR_STATUSES = ["available", "reserved", "sold"] as const;

export const MAX_FEATURES = 40;
/** Featured cars lead the home page's "Latest arrivals"; a small number keeps it meaningful. */
export const FEATURED_MAX = 3;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** "1,250,000" or "₱ 1 250 000" → 1250000, so admins can type prices naturally. */
function wholeNumber(label: string, min: number, max: number, grouping = true) {
  // Years read better without a thousands comma ("2027", not "2,027").
  const show = (n: number) => (grouping ? n.toLocaleString("en-PH") : String(n));
  return z.preprocess(
    (value) => (typeof value === "string" ? value.replace(/[₱,\s]/g, "") : value),
    z.coerce
      .number({ error: `Enter the ${label}` })
      .int(`Enter the ${label} as a whole number`)
      .min(min, `The ${label} must be at least ${show(min)}`)
      .max(max, `The ${label} must be at most ${show(max)}`),
  );
}

export function makeCarSchema(now = new Date()) {
  return z.object({
    make: z.string().trim().min(1, "Enter the make").max(40),
    model: z.string().trim().min(1, "Enter the model").max(60),
    variant: z.string().trim().max(60).default(""),
    year: wholeNumber("year", 1950, now.getFullYear() + 1, false),
    body_type: z.enum(BODY_TYPES, { error: "Choose a body type" }),
    transmission: z.enum(TRANSMISSIONS, { error: "Choose a transmission" }),
    fuel: z.enum(FUELS, { error: "Choose a fuel type" }),
    mileage_km: wholeNumber("mileage", 0, 2_000_000),
    price_php: wholeNumber("price", 10_000, 100_000_000),
    color: z.string().trim().max(40).default(""),
    description: z.string().trim().max(4000, "Keep the description under 4,000 characters").default(""),
    // One feature per line in the form; stored as a list.
    features: z
      .string()
      .max(6000)
      .default("")
      .transform((text) =>
        text
          .split(/\r?\n/)
          .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
          .filter(Boolean),
      )
      .pipe(
        z
          .array(z.string().max(120, "Keep each feature under 120 characters"))
          .max(MAX_FEATURES, `List up to ${MAX_FEATURES} features`),
      ),
    status: z.enum(CAR_STATUSES, { error: "Choose a status" }),
    featured: z.preprocess((value) => value === "yes", z.boolean()),
  });
}

export type CarInput = z.infer<ReturnType<typeof makeCarSchema>>;

export const uuidSchema = z.uuid();

/**
 * Identifies an image by its first bytes ("magic numbers") instead of trusting the
 * file name or the browser's claimed type, which an attacker controls.
 */
export function sniffImageType(bytes: Uint8Array): { mime: string; ext: string } | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0xff, 0xd8, 0xff)) return { mime: "image/jpeg", ext: "jpg" };
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { mime: "image/png", ext: "png" };
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}
