import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, CalendarCheck, Check, ChevronLeft } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { Gallery } from "@/components/cars/Gallery";
import { CompareButton } from "@/components/compare/CompareButton";
import { FavouriteButton } from "@/components/favourites/FavouriteButton";
import { PriceTag, TearLine } from "@/components/cars/PriceTag";
import { StatusBadge } from "@/components/cars/StatusBadge";
import { getAllCars, getCarBySlug } from "@/lib/data/cars";
import { formatKm, formatPeso } from "@/lib/format";
import { similarCars } from "@/lib/inventory";
import { LOAN_DEFAULTS } from "@/lib/loan";
import { BODY_TYPE_LABELS, carTitle, FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/types";

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const car = await getCarBySlug((await params).slug);
  if (!car) return { title: "Car not found" };
  return {
    title: `${carTitle(car)} ${car.variant}`,
    description: `${formatPeso(car.price_php)} · ${formatKm(car.mileage_km)} · ${car.description.slice(0, 120)}`,
  };
}

export default async function CarPage({ params }: PageProps<"/cars/[slug]">) {
  const { slug } = await params;
  const [car, cars] = await Promise.all([getCarBySlug(slug), getAllCars()]);
  if (!car) notFound();

  const title = carTitle(car);
  const similar = similarCars(car, cars);
  const sold = car.status === "sold";

  const specs = [
    ["Year", String(car.year)],
    ["Mileage", formatKm(car.mileage_km)],
    ["Transmission", TRANSMISSION_LABELS[car.transmission]],
    ["Fuel", FUEL_LABELS[car.fuel]],
    ["Body type", BODY_TYPE_LABELS[car.body_type]],
    ["Colour", car.color || "Ask us"],
  ];

  return (
    <div className="container-site py-6 sm:py-10">
      <Link
        href="/inventory"
        className="inline-flex items-center gap-1 py-1 text-sm font-semibold text-muted hover:text-ink"
      >
        <ChevronLeft aria-hidden size={16} />
        All cars
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div className="min-w-0">
          <Gallery photos={car.photos} bodyType={car.body_type} title={title} />
        </div>

        {/* Summary: on phones it sits right under the photos; on desktop it stays in view. */}
        <aside aria-label="Price and key details" className="lg:sticky lg:top-24 lg:row-span-2 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            {car.status !== "available" && <StatusBadge status={car.status} />}
          </div>
          <h1 className="font-wide mt-2 text-[28px] leading-tight font-extrabold">{title}</h1>
          <p className="mt-1 text-muted">{car.variant}</p>

          {/* The same hang-tag shape as the listing cards, at full size. */}
          <div className="mt-5 overflow-hidden rounded-card border border-line">
            <div className="p-5">
              <PriceTag price={car.price_php} size="large" showMonthly={!sold} />
            </div>
            <TearLine />
            <div className="p-5">
              {!sold && (
                <p className="text-sm text-muted tabular-nums">
                  Monthly estimate with {LOAN_DEFAULTS.downPaymentPct}% down over {LOAN_DEFAULTS.termMonths} months at a sample{" "}
                  {LOAN_DEFAULTS.annualRatePct}% yearly add-on rate.
                  Estimate only.
                </p>
              )}

              {sold ? (
                <div className="rounded-field bg-soft p-3 text-sm">
                  <p className="font-semibold">This car has been sold.</p>
                  <p className="mt-1 text-muted">See similar cars below that are still available.</p>
                </div>
              ) : (
                <div className="mt-5 grid gap-2">
                  {car.status === "reserved" && (
                    <p className="rounded-field bg-[#fff3d6] p-3 text-sm text-warn">
                      Reserved by another buyer. Ask us to put you next in line.
                    </p>
                  )}
                  <Link
                    href={`/test-drive?car=${car.slug}`}
                    className="flex items-center justify-center gap-2 rounded-field bg-signal px-4 py-3 font-semibold text-white hover:bg-signal-dark"
                  >
                    <CalendarCheck aria-hidden size={18} />
                    {car.status === "reserved" ? "Ask to be next in line" : "Book a test drive"}
                  </Link>
                  <Link
                    href={`/loan-calculator?price=${car.price_php}&car=${car.slug}`}
                    className="flex items-center justify-center gap-2 rounded-field border border-line px-4 py-3 font-semibold hover:border-ink"
                  >
                    <Calculator aria-hidden size={18} />
                    Adjust the loan estimate
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <FavouriteButton slug={car.slug} title={`${title} ${car.variant}`} price={car.price_php} variant="page" />
                    <CompareButton slug={car.slug} title={`${title} ${car.variant}`} variant="page" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {specs.map(([label, value]) => (
              <div key={label} className="border-b border-line pb-2">
                <dt className="text-muted">{label}</dt>
                <dd className="font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        {/* Full description and every feature: the original cut these off with "…". */}
        <div className="min-w-0 lg:col-start-1">
          <section aria-labelledby="about-title">
            <h2 id="about-title" className="font-wide text-xl font-bold">
              About this car
            </h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-ink-2">{car.description}</p>
          </section>

          {car.features.length > 0 && (
            <section aria-labelledby="features-title" className="mt-8">
              <h2 id="features-title" className="font-wide text-xl font-bold">
                Features <span className="text-base font-normal text-muted">({car.features.length})</span>
              </h2>
              <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {car.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check aria-hidden size={18} className="mt-0.5 shrink-0 text-ok" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar-title" className="mt-14 border-t border-line pt-10">
          <h2 id="similar-title" className="font-wide text-2xl font-bold">
            {sold ? "Still available: similar cars" : "Similar cars"}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((other) => (
              <li key={other.id} className="flex">
                <CarCard car={other} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
