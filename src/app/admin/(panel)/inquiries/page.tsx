import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CalendarDays, Mail, MessageCircle, Phone, Smartphone } from "lucide-react";
import { InquiryActions } from "@/components/admin/InquiryActions";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { formatDateTime, formatDay } from "@/lib/admin-format";
import {
  CONTACT_METHOD_LABELS,
  formatTimeSlot,
  INQUIRY_STATUS_LABELS,
  INQUIRY_STATUSES,
  type ContactMethod,
  type InquiryStatus,
} from "@/lib/inquiry";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Inquiries" };

type Row = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  contact_method: ContactMethod;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
  cars: { slug: string; year: number; make: string; model: string; variant: string } | null;
};

const METHOD_ICONS = { call: Phone, viber: Smartphone, messenger: MessageCircle, email: Mail } as const;

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: "bg-signal text-white",
  contacted: "bg-[#fff3d6] text-warn",
  closed: "bg-soft text-muted",
};

/**
 * Returns at once with a placeholder; the content below checks the login and loads
 * data on the server, then streams in. Keeps moving between admin pages instant.
 */
export default function InquiriesPage(props: PageProps<"/admin/inquiries">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InquiriesContent {...props} />
    </Suspense>
  );
}

async function InquiriesContent({ searchParams }: PageProps<"/admin/inquiries">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const filter = INQUIRY_STATUSES.find((s) => s === params.status);

  const { data } = await supabase
    .from("inquiries")
    .select("id, name, phone, email, contact_method, preferred_date, preferred_time, message, status, created_at, cars(slug, year, make, model, variant)")
    .order("created_at", { ascending: false });
  const all = (data ?? []) as unknown as Row[];
  const inquiries = filter ? all.filter((inquiry) => inquiry.status === filter) : all;

  const tabs = [
    { label: "All", href: "/admin/inquiries", count: all.length, active: !filter },
    ...INQUIRY_STATUSES.map((status) => ({
      label: INQUIRY_STATUS_LABELS[status],
      href: `/admin/inquiries?status=${status}`,
      count: all.filter((inquiry) => inquiry.status === status).length,
      active: filter === status,
    })),
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-wide text-3xl font-extrabold">Inquiries</h1>
        <p className="mt-1 text-sm text-muted">
          Newest first. Inquiries are deleted automatically after 30 days.
        </p>
      </div>

      <nav aria-label="Filter by status">
        <ul className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <li key={tab.label}>
              <Link
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  tab.active ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink"
                }`}
              >
                {tab.label}
                <span className="tabular-nums opacity-70">{tab.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {inquiries.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-paper p-8 text-center text-muted">
          No inquiries here.
        </p>
      ) : (
        <ul className="grid gap-3">
          {inquiries.map((inquiry) => {
            const MethodIcon = METHOD_ICONS[inquiry.contact_method];
            return (
              <li key={inquiry.id} className="grid gap-3 rounded-card border border-line bg-paper p-5">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{inquiry.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${STATUS_STYLES[inquiry.status]}`}
                      >
                        {INQUIRY_STATUS_LABELS[inquiry.status]}
                      </span>
                    </p>
                    <p className="text-sm text-muted tabular-nums">{formatDateTime(inquiry.created_at)}</p>
                  </div>
                  <InquiryActions id={inquiry.id} status={inquiry.status} name={inquiry.name} />
                </div>

                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-muted">Car</dt>
                    <dd className="font-semibold">
                      {inquiry.cars ? (
                        <Link href={`/cars/${inquiry.cars.slug}`} className="hover:underline">
                          {inquiry.cars.year} {inquiry.cars.make} {inquiry.cars.model} {inquiry.cars.variant}
                        </Link>
                      ) : (
                        "General question"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Contact by</dt>
                    <dd className="flex items-center gap-1.5 font-semibold">
                      <MethodIcon aria-hidden size={14} />
                      {CONTACT_METHOD_LABELS[inquiry.contact_method]}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted">Phone / email</dt>
                    <dd className="font-semibold break-words tabular-nums select-all">
                      {[inquiry.phone, inquiry.email].filter(Boolean).join(" · ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Preferred date and time</dt>
                    <dd className="flex items-center gap-1.5 font-semibold">
                      {inquiry.preferred_date ? (
                        <>
                          <CalendarDays aria-hidden size={14} />
                          {formatDay(inquiry.preferred_date)}
                          {inquiry.preferred_time && ` · ${formatTimeSlot(inquiry.preferred_time.slice(0, 5))}`}
                        </>
                      ) : (
                        "Not given"
                      )}
                    </dd>
                  </div>
                </dl>

                {/* Shown as plain text: React escapes it, and links are not made clickable. */}
                {inquiry.message && (
                  <p className="rounded-field bg-soft p-3 text-[15px] break-words whitespace-pre-wrap">
                    {inquiry.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
