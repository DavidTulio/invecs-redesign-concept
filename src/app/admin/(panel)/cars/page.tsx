import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Plus, Star } from "lucide-react";
import { CarStatusSelect } from "@/components/admin/CarStatusSelect";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { CAR_STATUSES } from "@/lib/car-schema";
import { formatPeso, mileageLabel } from "@/lib/format";
import { requireAdmin } from "@/lib/server/auth";
import { carPhotoUrl } from "@/lib/supabase/public";
import { carTitle } from "@/lib/types";

export const metadata: Metadata = { title: "Cars" };

type Row = {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  variant: string;
  price_php: number;
  mileage_km: number | null;
  status: string;
  featured: boolean;
  car_photos: { path: string; position: number }[];
};

/**
 * Returns at once with a placeholder; the content below checks the login and loads
 * data on the server, then streams in. Keeps moving between admin pages instant.
 */
export default function AdminCarsPage(props: PageProps<"/admin/cars">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminCarsContent {...props} />
    </Suspense>
  );
}

async function AdminCarsContent({ searchParams }: PageProps<"/admin/cars">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const filter = CAR_STATUSES.find((s) => s === params.status);

  const { data } = await supabase
    .from("cars")
    .select("id, slug, year, make, model, variant, price_php, mileage_km, status, featured, car_photos(path, position)")
    .order("created_at", { ascending: false });
  const all = (data ?? []) as Row[];
  const cars = filter ? all.filter((car) => car.status === filter) : all;

  const tabs = [
    { label: "All", href: "/admin/cars", count: all.length, active: !filter },
    ...CAR_STATUSES.map((status) => ({
      label: status[0].toUpperCase() + status.slice(1),
      href: `/admin/cars?status=${status}`,
      count: all.filter((car) => car.status === status).length,
      active: filter === status,
    })),
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-wide text-3xl font-extrabold">Cars</h1>
        <Link
          href="/admin/cars/new"
          className="flex items-center gap-2 rounded-field bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark"
        >
          <Plus aria-hidden size={18} />
          Add a car
        </Link>
      </div>

      {params.deleted && (
        <p role="status" className="rounded-field bg-[#e6f4ed] p-3 text-sm font-semibold text-ok">
          The car and its photos were deleted.
        </p>
      )}

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

      {cars.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-paper p-8 text-center text-muted">
          No cars here yet.
        </p>
      ) : (
        <ul className="grid gap-2">
          {cars.map((car) => {
            const cover = [...car.car_photos].sort((a, b) => a.position - b.position)[0];
            const title = carTitle(car);
            return (
              <li
                key={car.id}
                className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-card border border-line bg-paper p-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto_auto]"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-field bg-soft">
                  {cover ? (
                    <Image src={carPhotoUrl(cover.path)} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center text-muted" title="No photos yet">
                      <ImageOff aria-hidden size={20} />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <Link href={`/admin/cars/${car.id}`} className="font-semibold hover:underline">
                    {title}
                  </Link>
                  {car.featured && (
                    <span className="ml-2 inline-flex items-center gap-1 align-middle text-xs font-semibold text-ink-2">
                      <Star aria-hidden size={13} className="fill-current" />
                      Featured
                    </span>
                  )}
                  <p className="truncate text-sm text-muted">
                    {car.variant} · {mileageLabel(car.mileage_km)} · {car.car_photos.length}{" "}
                    {car.car_photos.length === 1 ? "photo" : "photos"}
                  </p>
                </div>
                <p className="font-display col-start-2 font-extrabold tabular-nums sm:col-start-auto">
                  {formatPeso(car.price_php)}
                </p>
                <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-auto">
                  <CarStatusSelect carId={car.id} status={car.status} title={title} />
                  <Link
                    href={`/admin/cars/${car.id}`}
                    className="rounded-field border border-line px-3 py-1.5 text-sm font-semibold hover:border-ink"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
