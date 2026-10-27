import Link from "next/link";
import { formatKm } from "@/lib/format";
import { carTitle, FUEL_LABELS, TRANSMISSION_LABELS, type Car } from "@/lib/types";
import { FavouriteButton } from "@/components/favourites/FavouriteButton";
import { CarImage } from "./CarImage";
import { PriceTag, TearLine } from "./PriceTag";
import { StatusBadge } from "./StatusBadge";

const CARD_SIZES = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw";

/** A listing card shaped like a dealer's hang tag: details on top, price below the tear line. */
export function CarCard({ car, preload = false }: { car: Car; preload?: boolean }) {
  return (
    <article className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-[0_8px_24px_-12px_rgb(14_26_43/0.3)]">
      <div className="relative aspect-[16/10] max-w-full overflow-hidden bg-soft">
        <CarImage photo={car.photos[0]} bodyType={car.body_type} sizes={CARD_SIZES} preload={preload} />
        {car.status !== "available" && (
          <StatusBadge status={car.status} className="absolute top-3 left-3" />
        )}
        {/* Only the heart sits on the photo; Compare lives on the car page and the Saved page. */}
        <div className="absolute top-2.5 right-2.5">
          <FavouriteButton slug={car.slug} title={`${carTitle(car)} ${car.variant}`} price={car.price_php} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-wide text-[17px] leading-tight font-bold">
          <Link href={`/cars/${car.slug}`} className="after:absolute after:inset-0">
            {carTitle(car)}
          </Link>
        </h3>
        <p className="text-sm text-muted">{car.variant}</p>
        <p className="mt-auto pt-1 text-[13px] text-muted tabular-nums">
          {TRANSMISSION_LABELS[car.transmission]} · {FUEL_LABELS[car.fuel]} · {formatKm(car.mileage_km)}
        </p>
      </div>

      <TearLine />
      <div className="px-4 pt-3 pb-4">
        <PriceTag price={car.price_php} />
      </div>
    </article>
  );
}
