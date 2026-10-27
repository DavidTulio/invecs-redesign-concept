"use server";

import { headers } from "next/headers";
import { getAllCars } from "@/lib/data/cars";
import { fieldErrors, makeInquirySchema, type InquiryField } from "@/lib/inquiry";
import { checkFormStamp, clientIp, hashIp } from "@/lib/server/form-guard";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { createAdminClient } from "@/lib/supabase/admin";

export type InquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<InquiryField, string>>;
  /** What the visitor typed, so a failed submit doesn't wipe the form. */
  values?: Record<string, string>;
  /** Changes on every response so the form knows to reset the CAPTCHA. */
  attempt?: number;
};

const FIELDS = ["car", "name", "phone", "email", "contact_method", "preferred_date", "preferred_time", "message"] as const;

const GENERIC_ERROR = "Something went wrong on our side. Please try again in a minute.";

/**
 * Saves a test-drive request or inquiry. Every check runs on the server, because
 * anything in the browser (including hidden fields and disabled buttons) can be bypassed.
 * Order: cheapest checks first, so bots are turned away before we spend any work on them.
 */
export async function submitInquiry(_previous: InquiryState, formData: FormData): Promise<InquiryState> {
  const attempt = Date.now();
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "").slice(0, 1200)]),
  );
  const fail = (message: string, errors?: InquiryState["errors"]): InquiryState => ({
    status: "error",
    message,
    errors,
    values,
    attempt,
  });

  // 1. Honeypot: a field humans never see. If it's filled in, a bot sent this.
  //    We pretend it worked so the bot learns nothing, and save nothing.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success", attempt };
  }

  // 2. Timing: submitted too fast to be a person, or the page is hours old.
  const stamp = checkFormStamp(formData.get("form_stamp"));
  if (stamp === "too-fast") return { status: "success", attempt };
  if (stamp === "expired") return fail("This form has been open for a while. Please refresh the page and try again.");
  if (stamp === "invalid") return fail("Please refresh the page and try again.");

  // 3. Validation: the same rules as the browser, enforced here for real.
  const parsed = makeInquirySchema().safeParse(values);
  if (!parsed.success) {
    return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  }
  const inquiry = parsed.data;

  const requestHeaders = await headers();
  const ip = clientIp(requestHeaders);
  const supabase = createAdminClient();

  // 4. Rate limit: at most 5 attempts per visitor per 10 minutes, counted in the database
  //    so it holds across every server instance.
  const { data: allowed, error: limitError } = await supabase.rpc("register_inquiry_attempt", {
    p_ip_hash: hashIp(ip ?? "unknown"),
  });
  if (limitError) {
    console.error("Rate limit check failed:", limitError.message);
    return fail(GENERIC_ERROR);
  }
  if (!allowed) {
    return fail("You've sent several messages in a short time. Please wait 10 minutes and try again.");
  }

  // 5. CAPTCHA: confirm with Cloudflare that a human solved it.
  const captchaPassed = await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? ""), ip, "inquiry");
  if (!captchaPassed) {
    return fail("Please complete the \"I'm human\" check, then send again.");
  }

  // 6. The chosen car must exist and still be for sale.
  let carId: string | null = null;
  if (inquiry.car) {
    const car = (await getAllCars()).find((c) => c.slug === inquiry.car);
    if (!car || car.status === "sold") {
      return fail("That car is no longer available. Please choose another one.", {
        car: "This car is no longer available",
      });
    }
    carId = car.id;
  }

  // 7. Save. Only these columns are sent; status and created_at are set by the database.
  //    Values travel separately from the SQL, so text like "'; DROP TABLE" is stored as plain text.
  const { error: insertError } = await supabase.from("inquiries").insert({
    car_id: carId,
    name: inquiry.name,
    phone: inquiry.phone ?? null,
    email: inquiry.email ?? null,
    contact_method: inquiry.contact_method,
    preferred_date: inquiry.preferred_date,
    preferred_time: inquiry.preferred_time,
    message: inquiry.message,
  });
  if (insertError) {
    console.error("Saving inquiry failed:", insertError.message);
    return fail(GENERIC_ERROR);
  }

  // 8. Housekeeping: delete inquiries older than 30 days. Not critical, so errors are only logged.
  const { error: purgeError } = await supabase.rpc("purge_expired_data");
  if (purgeError) console.error("Purge failed:", purgeError.message);

  return { status: "success", message: inquiry.name, attempt };
}
