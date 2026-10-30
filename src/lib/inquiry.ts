import { z } from "@/lib/zod";

// One schema for the inquiry form, used by the browser (instant feedback) and
// re-checked by the server (the only check that counts; browsers can be bypassed).

export const CONTACT_METHODS = ["call", "viber", "messenger", "email"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  call: "Phone call",
  viber: "Viber",
  messenger: "Messenger",
  email: "Email",
};

export const MESSAGE_MAX = 1000;
export const BOOKING_WINDOW_DAYS = 90;

/** Optional trade-in: the car the buyer wants to hand in as part of the payment. */
export const TRADE_IN_OLDEST_YEAR = 1980;
export const TRADE_IN_MAX_KM = 1_000_000;
export const TRADE_IN_NOTES_MAX = 300;

/**
 * "Ask for more details" links on a car page (?ask=mileage) open the form with the
 * question already written, so the buyer only has to add how to reach them.
 */
export const ASK_TOPICS = ["mileage", "colour", "details"] as const;
export type AskTopic = (typeof ASK_TOPICS)[number];

export function askMessage(topic: AskTopic, car: string) {
  if (topic === "mileage") return `Hi! What is the mileage of the ${car}?`;
  if (topic === "colour") return `Hi! What colour is the ${car}?`;
  return `Hi! Could you send me more details about the ${car}, like the mileage, condition and service history?`;
}

/** Private staff notes on an inquiry (admin only). */
export const STAFF_NOTES_MAX = 1000;

/** Test-drive start times: hourly within showroom hours (8 AM–6 PM), so every drive ends before closing. */
export const TEST_DRIVE_TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"] as const;

/** "13:00" → "1:00 PM" */
export function formatTimeSlot(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

/** Today's date in the Philippines as YYYY-MM-DD, whatever the server's time zone. */
export function manilaDate(date: Date, addDays = 0) {
  const shifted = new Date(date.getTime() + addDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(shifted);
}

/** "0917 510 3858", "+63 917-510-3858" or "639175103858" → "+639175103858". Otherwise null. */
export function normalizePhilippineMobile(input: string) {
  const digits = input.replace(/[\s\-().]/g, "");
  const match = digits.match(/^(?:\+?63|0)(9\d{9})$/);
  return match ? `+63${match[1]}` : null;
}

const countLinks = (text: string) => (text.match(/https?:\/\/|www\./gi) ?? []).length;
// Short fields never need a web address; refusing them stops spam like "www.spam.com" as a name.
const noLinks = (text: string) => countLinks(text) === 0;

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

/** "85,000 km" → "85000", so people can type numbers the way they write them. */
const plainNumber = (value: unknown) =>
  emptyToUndefined(typeof value === "string" ? value.replace(/[\s,]|km/gi, "") : value);

/** The trade-in car, or null when the buyer didn't tick "I have a car to trade in". */
export function tradeInOf(inquiry: InquiryInput) {
  if (!inquiry.trade_in || !inquiry.trade_in_make || !inquiry.trade_in_model || !inquiry.trade_in_year) return null;
  return {
    make: inquiry.trade_in_make,
    model: inquiry.trade_in_model,
    year: inquiry.trade_in_year,
    mileageKm: inquiry.trade_in_mileage ?? null,
    notes: inquiry.trade_in_notes ?? null,
  };
}

export function makeInquirySchema(now = new Date()) {
  const firstDay = manilaDate(now, 1); // test drives start tomorrow at the earliest
  const lastDay = manilaDate(now, BOOKING_WINDOW_DAYS);
  const newestTradeInYear = Number(manilaDate(now).slice(0, 4)) + 1;

  return z
    .object({
      car: z.preprocess(
        emptyToUndefined,
        z.string().max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Choose a car from the list").optional(),
      ),
      name: z
        .string({ error: "Enter your name" })
        .trim()
        .min(2, "Enter your name")
        .max(80, "Keep your name under 80 characters")
        .refine(noLinks, "Please enter your name without web links"),
      phone: z.preprocess(
        emptyToUndefined,
        z
          .string()
          .max(30)
          .transform((value, ctx) => {
            const phone = normalizePhilippineMobile(value);
            if (!phone) {
              ctx.addIssue({ code: "custom", message: "Enter a PH mobile number, like 0917 123 4567" });
              return z.NEVER;
            }
            return phone;
          })
          .optional(),
      ),
      email: z.preprocess(
        emptyToUndefined,
        z.email("Enter a valid email address").max(254).toLowerCase().optional(),
      ),
      contact_method: z.enum(CONTACT_METHODS, { error: "Choose how we should contact you" }),
      preferred_date: z.preprocess(
        emptyToUndefined,
        z
          .string({ error: "Choose a test-drive date" })
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a test-drive date")
          .refine((d) => d >= firstDay && d <= lastDay, `Choose a date from tomorrow up to ${BOOKING_WINDOW_DAYS} days ahead`),
      ),
      preferred_time: z.enum(TEST_DRIVE_TIMES, { error: "Choose a test-drive time" }),
      message: z
        .string()
        .trim()
        .max(MESSAGE_MAX, `Keep your message under ${MESSAGE_MAX} characters`)
        .refine((text) => countLinks(text) <= 2, "Please remove the links from your message")
        .default(""),
      trade_in: z.preprocess((value) => value === "yes", z.boolean()),
      trade_in_make: z.preprocess(
        emptyToUndefined,
        z.string().trim().max(40, "Keep the make under 40 characters").refine(noLinks, "Enter the make without web links").optional(),
      ),
      trade_in_model: z.preprocess(
        emptyToUndefined,
        z.string().trim().max(60, "Keep the model under 60 characters").refine(noLinks, "Enter the model without web links").optional(),
      ),
      trade_in_year: z.preprocess(
        plainNumber,
        z.coerce
          .number({ error: "Enter the year, like 2016" })
          .int("Enter the year, like 2016")
          .min(TRADE_IN_OLDEST_YEAR, `Enter a year from ${TRADE_IN_OLDEST_YEAR} to ${newestTradeInYear}`)
          .max(newestTradeInYear, `Enter a year from ${TRADE_IN_OLDEST_YEAR} to ${newestTradeInYear}`)
          .optional(),
      ),
      trade_in_mileage: z.preprocess(
        plainNumber,
        z.coerce
          .number({ error: "Enter the mileage in km, like 85000" })
          .int("Enter the mileage in km, like 85000")
          .min(0, "Enter the mileage in km, like 85000")
          .max(TRADE_IN_MAX_KM, "Enter the mileage in km, up to 1,000,000")
          .optional(),
      ),
      trade_in_notes: z.preprocess(
        emptyToUndefined,
        z
          .string()
          .trim()
          .max(TRADE_IN_NOTES_MAX, `Keep the notes under ${TRADE_IN_NOTES_MAX} characters`)
          .refine(noLinks, "Please remove the links from the notes")
          .optional(),
      ),
    })
    // These checks compare fields with each other. By default Zod skips them while any field
    // has a mistake; `when` runs them as long as their own fields are valid, so the visitor
    // sees every problem in one round instead of fixing the form twice.
    .superRefine(
      (data, ctx) => {
        // Ask for the detail that matches the chosen contact method.
        if ((data.contact_method === "call" || data.contact_method === "viber") && !data.phone) {
          ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter your mobile number so we can reach you" });
        }
        if (data.contact_method === "email" && !data.email) {
          ctx.addIssue({ code: "custom", path: ["email"], message: "Enter your email address" });
        }
        if (data.contact_method === "messenger" && !data.phone && !data.email) {
          ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a mobile number or email so we can find you" });
        }
      },
      { when: fieldsValid((field) => ["contact_method", "phone", "email"].includes(field)) },
    )
    .superRefine(
      (data, ctx) => {
        // The trade-in fields only count when the box is ticked; then make, model and year are needed.
        if (!data.trade_in) return;
        if (!data.trade_in_make) ctx.addIssue({ code: "custom", path: ["trade_in_make"], message: "Enter the make, like Toyota" });
        if (!data.trade_in_model) ctx.addIssue({ code: "custom", path: ["trade_in_model"], message: "Enter the model, like Vios" });
        if (!data.trade_in_year) ctx.addIssue({ code: "custom", path: ["trade_in_year"], message: "Enter the year, like 2016" });
      },
      { when: fieldsValid((field) => field.startsWith("trade_in")) },
    );
}

/** For `superRefine({ when })`: true while none of the matching fields has a mistake yet. */
function fieldsValid(matches: (field: string) => boolean) {
  return (payload: { issues: { path?: PropertyKey[] }[] }) =>
    payload.issues.every((issue) => !matches(String(issue.path?.[0] ?? "")));
}

export type InquiryInput = z.infer<ReturnType<typeof makeInquirySchema>>;
export type InquiryField = keyof InquiryInput;

/** Field name → first error message, for showing next to each input. */
export function fieldErrors(error: z.ZodError): Partial<Record<InquiryField, string>> {
  const errors: Partial<Record<InquiryField, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as InquiryField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};
