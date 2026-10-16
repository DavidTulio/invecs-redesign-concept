import Link from "next/link";
import { formatKm, formatPeso } from "@/lib/format";
import { estimateMonthly } from "@/lib/loan";
import { carTitle, FUEL_LABELS, TRANSMISSION_LABELS, type Car } from "@/lib/types";
import { CarImage } from "./CarImage";
import { StatusBadge } from "./StatusBadge";

const CARD_SIZES = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw";

export function CarCard({ car, preload = false }: { car: Car; preload?: boolean }) {
  return (
    <article className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-[0_8px_24px_-12px_rgb(14_26_43/0.3)]">
      <div className="relative aspect-[16/10] max-w-full overflow-hidden bg-soft">
        <CarImage photo={car.photos[0]} bodyType={car.body_type} sizes={CARD_SIZES} preload={preload} />
        {car.status !== "available" && (
          <StatusBadge status={car.status} className="absolute top-3 left-3" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-wide text-[17px] leading-tight font-bold">
          <Link href={`/cars/${car.slug}`} className="after:absolute after:inset-0">
            {carTitle(car)}
          </Link>
        </h3>
        <p className="text-sm text-muted">{car.variant}</p>
        <p className="text-[13px] text-muted tabular-nums">
          {TRANSMISSION_LABELS[car.transmission]} · {FUEL_LABELS[car.fuel]} · {formatKm(car.mileage_km)}
        </p>

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line pt-3">
          <p className="font-display text-[22px] leading-none font-extrabold tabular-nums">
            {formatPeso(car.price_php)}
          </p>
          <p className="text-sm font-semibold text-signal tabular-nums">
            ≈ {formatPeso(estimateMonthly(car.price_php))}/mo
          </p>
        </div>
      </div>
    </article>
  );
}
