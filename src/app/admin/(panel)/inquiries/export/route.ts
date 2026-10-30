import type { NextRequest } from "next/server";
import { formatDateTime, formatDay } from "@/lib/admin-format";
import { toCsv } from "@/lib/csv";
import {
  CONTACT_METHOD_LABELS,
  formatTimeSlot,
  INQUIRY_STATUS_LABELS,
  INQUIRY_STATUSES,
  manilaDate,
  questionLabel,
  type ContactMethod,
  type InquiryStatus,
  type QuestionTopic,
} from "@/lib/inquiry";
import { requireAdmin } from "@/lib/server/auth";

type Row = {
  name: string;
  phone: string | null;
  email: string | null;
  contact_method: ContactMethod;
  topic: QuestionTopic | null;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string;
  trade_in_make: string | null;
  trade_in_model: string | null;
  trade_in_year: number | null;
  trade_in_mileage_km: number | null;
  trade_in_notes: string | null;
  staff_notes: string;
  status: InquiryStatus;
  created_at: string;
  cars: { year: number; make: string; model: string; variant: string } | null;
};

/**
 * The inquiries inbox as a CSV file (admins only), for the tab the admin is on.
 * Built fresh on every request and never cached, because it holds buyers' contact details.
 */
export async function GET(request: NextRequest) {
  const { supabase } = await requireAdmin(); // not signed in as an admin → sent to the login page
  const status = INQUIRY_STATUSES.find((s) => s === request.nextUrl.searchParams.get("status"));

  let query = supabase
    .from("inquiries")
    .select(
      "name, phone, email, contact_method, topic, preferred_date, preferred_time, message, trade_in_make, trade_in_model, trade_in_year, trade_in_mileage_km, trade_in_notes, staff_notes, status, created_at, cars(year, make, model, variant)",
    )
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return new Response("Couldn't load the inquiries. Please try again.", { status: 500 });

  const rows = (data ?? []) as unknown as Row[];
  const csv = toCsv([
    [
      "Received",
      "Status",
      "Name",
      "Phone",
      "Email",
      "Contact by",
      "Car",
      "Test-drive date",
      "Test-drive time",
      "Trade-in",
      "Trade-in mileage (km)",
      "Trade-in notes",
      "Message",
      "Staff notes",
    ],
    ...rows.map((row) => [
      formatDateTime(row.created_at),
      INQUIRY_STATUS_LABELS[row.status],
      row.name,
      // Local format ("0917 …") reads naturally and can't be mistaken for a formula.
      row.phone?.replace(/^\+63/, "0") ?? "",
      row.email,
      CONTACT_METHOD_LABELS[row.contact_method],
      row.cars ? `${row.cars.year} ${row.cars.make} ${row.cars.model} ${row.cars.variant}`.trim() : questionLabel(row.topic),
      row.preferred_date ? formatDay(row.preferred_date) : "",
      row.preferred_time ? formatTimeSlot(row.preferred_time.slice(0, 5)) : "",
      row.trade_in_make ? `${row.trade_in_year} ${row.trade_in_make} ${row.trade_in_model}` : "",
      row.trade_in_mileage_km,
      row.trade_in_notes,
      row.message,
      row.staff_notes,
    ]),
  ]);

  const filename = `inquiries-${status ?? "all"}-${manilaDate(new Date())}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, private",
    },
  });
}
