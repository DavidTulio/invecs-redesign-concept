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

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export function makeInquirySchema(now = new Date()) {
  const firstDay = manilaDate(now, 1); // test drives start tomorrow at the earliest
  const lastDay = manilaDate(now, BOOKING_WINDOW_DAYS);

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
        .max(80, "Keep your name under 80 characters"),
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
      message: z
        .string()
        .trim()
        .max(MESSAGE_MAX, `Keep your message under ${MESSAGE_MAX} characters`)
        .refine((text) => countLinks(text) <= 2, "Please remove the links from your message")
        .default(""),
    })
    .superRefine((data, ctx) => {
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
    });
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
