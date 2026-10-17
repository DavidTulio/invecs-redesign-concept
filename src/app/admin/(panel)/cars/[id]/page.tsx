import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { CarForm } from "@/components/admin/CarForm";
import { DeleteCar } from "@/components/admin/DeleteCar";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { uuidSchema } from "@/lib/car-schema";
import { requireAdmin } from "@/lib/server/auth";
import { carPhotoUrl } from "@/lib/supabase/public";
import { carTitle, type Car, type CarPhoto } from "@/lib/types";

export const metadata: Metadata = { title: "Edit car" };

type Row = Omit<Car, "photos"> & { car_photos: (CarPhoto & { id: string })[] };

/**
 * Returns at once with a placeholder; the content below checks the login and loads
 * data on the server, then streams in. Keeps moving between admin pages instant.
 */
export default function EditCarPage(props: PageProps<"/admin/cars/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditCarContent {...props} />
    </Suspense>
  );
}

async function EditCarContent({ params, searchParams }: PageProps<"/admin/cars/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;
  if (!uuidSchema.safeParse(id).success) notFound();

  const { data } = await supabase
    .from("cars")
    .select("*, car_photos(id, path, position, alt, credit_name, credit_url)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const car = data as Row;
  const title = carTitle(car);
  const photos = [...car.car_photos]
    .sort((a, b) => a.position - b.position)
    .map((p) => ({ id: p.id, url: carPhotoUrl(p.path), alt: p.alt }));

  return (
    <div className="grid max-w-5xl gap-8">
      <div className="grid gap-3">
        <Link href="/admin/cars" className="flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
          <ChevronLeft aria-hidden size={16} />
          All cars
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-wide text-3xl font-extrabold">{title}</h1>
            <p className="text-muted">{car.variant}</p>
          </div>
          <Link
            href={`/cars/${car.slug}`}
            className="flex items-center gap-1.5 rounded-field border border-line bg-paper px-3 py-2 text-sm font-semibold hover:border-ink"
          >
            View on website <ExternalLink aria-hidden size={14} />
          </Link>
        </div>
        {created && (
          <p role="status" className="rounded-field bg-[#e6f4ed] p-3 text-sm font-semibold text-ok">
            Car added. Now upload its photos below.
          </p>
        )}
      </div>

      <div className="rounded-card border border-line bg-paper p-5 sm:p-6">
        <PhotoManager carId={car.id} photos={photos} />
      </div>

      <div className="rounded-card border border-line bg-paper p-5 sm:p-6">
        <h2 className="font-wide mb-4 text-xl font-bold">Details</h2>
        <CarForm
          initial={{
            id: car.id,
            make: car.make,
            model: car.model,
            variant: car.variant,
            year: String(car.year),
            body_type: car.body_type,
            transmission: car.transmission,
            fuel: car.fuel,
            mileage_km: String(car.mileage_km),
            price_php: String(car.price_php),
            color: car.color,
            description: car.description,
            features: car.features.join("\n"),
            status: car.status,
          }}
        />
      </div>

      <DeleteCar carId={car.id} title={title} />
    </div>
  );
}
