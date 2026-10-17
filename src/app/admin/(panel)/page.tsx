import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { daysAgoIso, formatDateTime } from "@/lib/admin-format";
import { CONTACT_METHOD_LABELS, type ContactMethod } from "@/lib/inquiry";
import { requireAdmin } from "@/lib/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CarStatus } from "@/lib/types";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Returns at once with a placeholder; the content below checks the login and loads
 * data on the server, then streams in. Keeps moving between admin pages instant.
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const { supabase, email } = await requireAdmin();

  // Privacy housekeeping on every admin visit: remove inquiries older than 30 days.
  const { error: purgeError } = await createAdminClient().rpc("purge_expired_data");
  if (purgeError) console.error("Purge failed:", purgeError.message);

  const weekAgo = daysAgoIso(7);
  const [{ data: cars }, { data: inquiries }] = await Promise.all([
    supabase.from("cars").select("status"),
    supabase
      .from("inquiries")
      .select("id, name, contact_method, status, created_at, cars(year, make, model)")
      .order("created_at", { ascending: false }),
  ]);

  const byStatus = (status: CarStatus) => (cars ?? []).filter((car) => car.status === status).length;
  const all = inquiries ?? [];
  const thisWeek = all.filter((inquiry) => inquiry.created_at >= weekAgo).length;
  const waiting = all.filter((inquiry) => inquiry.status === "new");

  const carTiles = [
    { label: "Available", value: byStatus("available"), href: "/admin/cars?status=available", tone: "text-ok" },
    { label: "Reserved", value: byStatus("reserved"), href: "/admin/cars?status=reserved", tone: "text-warn" },
    { label: "Sold", value: byStatus("sold"), href: "/admin/cars?status=sold", tone: "text-muted" },
  ];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-wide text-3xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Signed in as {email}</p>
        </div>
        <Link
          href="/admin/cars/new"
          className="flex items-center gap-2 rounded-field bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark"
        >
          <Plus aria-hidden size={18} />
          Add a car
        </Link>
      </div>

      <section aria-labelledby="cars-title">
        <h2 id="cars-title" className="text-sm font-semibold tracking-wide text-muted uppercase">
          Cars by status
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {carTiles.map((tile) => (
            <li key={tile.label}>
              <Link href={tile.href} className="block rounded-card border border-line bg-paper p-5 hover:border-ink">
                <p className="text-sm font-semibold text-ink-2">{tile.label}</p>
                <p className={`font-display mt-1 text-4xl font-extrabold tabular-nums ${tile.tone}`}>{tile.value}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="inq-title" className="grid gap-3 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
          <h2 id="inq-title" className="text-sm font-semibold tracking-wide text-muted uppercase">
            Inquiries
          </h2>
          <Link href="/admin/inquiries" className="block rounded-card border border-line bg-paper p-5 hover:border-ink">
            <p className="text-sm font-semibold text-ink-2">New this week</p>
            <p className="font-display mt-1 text-4xl font-extrabold text-signal tabular-nums">{thisWeek}</p>
          </Link>
          <Link
            href="/admin/inquiries?status=new"
            className="block rounded-card border border-line bg-paper p-5 hover:border-ink"
          >
            <p className="text-sm font-semibold text-ink-2">Waiting for a reply</p>
            <p className="font-display mt-1 text-4xl font-extrabold tabular-nums">{waiting.length}</p>
          </Link>
        </div>

        <div className="rounded-card border border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h3 className="font-semibold">Waiting for a reply</h3>
            <Link href="/admin/inquiries?status=new" className="flex items-center gap-1 text-sm font-semibold text-signal">
              Open inbox <ArrowRight aria-hidden size={16} />
            </Link>
          </div>
          {waiting.length === 0 ? (
            <p className="px-5 py-8 text-center text-muted">All caught up. No new inquiries.</p>
          ) : (
            <ul className="divide-y divide-line">
              {waiting.slice(0, 5).map((inquiry) => {
                const car = inquiry.cars as unknown as { year: number; make: string; model: string } | null;
                return (
                  <li key={inquiry.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm">
                    <span>
                      <span className="font-semibold">{inquiry.name}</span>
                      <span className="text-muted">
                        {" · "}
                        {car ? `${car.year} ${car.make} ${car.model}` : "General question"}
                        {" · "}
                        {CONTACT_METHOD_LABELS[inquiry.contact_method as ContactMethod]}
                      </span>
                    </span>
                    <span className="text-muted tabular-nums">{formatDateTime(inquiry.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
