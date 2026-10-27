import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { CarImage } from "@/components/cars/CarImage";
import { StatusBadge } from "@/components/cars/StatusBadge";
import { CompareRemove, CompareSync } from "@/components/compare/CompareControls";
import { getAllCars } from "@/lib/data/cars";
import { allSame, bestByRow, COMPARE_MAX, featureUnion, parseCompareParam } from "@/lib/compare";
import { formatKm, formatPeso } from "@/lib/format";
import { estimateMonthly, LOAN_DEFAULTS } from "@/lib/loan";
import { BODY_TYPE_LABELS, carTitle, FUEL_LABELS, TRANSMISSION_LABELS, type Car } from "@/lib/types";

export const metadata: Metadata = {
  title: "Compare cars",
  description: "Compare up to three cars side by side: price, monthly estimate, mileage, specs and features.",
};

export default function ComparePage({ searchParams }: PageProps<"/compare">) {
  return (
    <div className="container-site py-8 sm:py-12">
      <h1 className="font-wide text-3xl font-extrabold sm:text-4xl">Compare cars</h1>
      {/* The heading ships instantly; the table streams in once the link's cars are read. */}
      <Suspense fallback={<p className="mt-6 text-muted">Loading the comparison…</p>}>
        <Comparison searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Comparison({ searchParams }: Pick<PageProps<"/compare">, "searchParams">) {
  const slugs = parseCompareParam((await searchParams).cars);
  const all = await getAllCars();
  const cars = slugs.map((slug) => all.find((car) => car.slug === slug)).filter((car): car is Car => !!car);
  const missing = slugs.length - cars.length;
  const items = cars.map((car) => ({ slug: car.slug, title: `${carTitle(car)} ${car.variant}` }));

  if (cars.length === 0) {
    return (
      <div className="mt-6 max-w-xl rounded-card border border-line p-6">
        <CompareSync items={[]} />
        <p className="font-semibold">No cars picked yet.</p>
        <p className="mt-1 text-muted">
          Tap <strong className="text-ink">Compare</strong> on any car to add it. You can compare up to{" "}
          {COMPARE_MAX} cars side by side.
        </p>
        <Link
          href="/inventory"
          className="mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-field bg-ink px-4 font-semibold text-white hover:bg-ink-2"
        >
          Browse cars
          <ArrowRight aria-hidden size={16} />
        </Link>
      </div>
    );
  }

  const best = bestByRow(cars);
  const ids = cars.map((car) => car.slug);
  const spec = (label: string, values: string[], bestKey?: keyof typeof best, word?: string) => (
    <Row
      label={label}
      same={allSame(values)}
      cells={values.map((value, i) => (
        <Value key={ids[i]} best={bestKey ? best[bestKey].has(ids[i]) : false} word={word}>
          {value}
        </Value>
      ))}
    />
  );

  return (
    <>
      <CompareSync items={items} />
      <p className="mt-3 max-w-[65ch] text-muted">
        The lowest price, lowest mileage and newest year are marked in green. Monthly estimates assume{" "}
        {LOAN_DEFAULTS.downPaymentPct}% down over {LOAN_DEFAULTS.termMonths} months; estimate only.
      </p>
      {missing > 0 && (
        <p className="mt-3 rounded-field bg-soft p-3 text-sm">
          {missing === 1 ? "1 car" : `${missing} cars`} from this link {missing === 1 ? "is" : "are"} no longer listed.
        </p>
      )}

      <div className="mt-6 [&:has(#diff-only:checked)_[data-same]]:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold">
            <input id="diff-only" type="checkbox" className="size-5 accent-[var(--color-ink)]" />
            Show only differences
          </label>
          {cars.length < COMPARE_MAX && (
            <Link href="/inventory" className="inline-flex min-h-11 items-center gap-1 font-semibold text-signal hover:underline">
              Add another car
              <ArrowRight aria-hidden size={16} />
            </Link>
          )}
        </div>

        {/* Phones: the table scrolls sideways while the row names stay put. "relative" keeps
            screen-reader-only text inside the scroll box instead of widening the page. */}
        <div className="relative mt-4 overflow-x-auto rounded-card border border-line">
          <table className="w-full table-fixed border-separate border-spacing-0 text-sm" style={{ minWidth: `${7 + cars.length * 10.5}rem` }}>
            <caption className="sr-only">Side-by-side comparison of {cars.length} cars</caption>
            <thead>
              <tr>
                <td className="sticky left-0 z-10 w-28 border-b border-line bg-paper sm:w-40" />
                {cars.map((car) => (
                  <th key={car.slug} scope="col" className="border-b border-l border-line p-3 text-left align-top font-normal">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-field bg-soft">
                      <CarImage photo={car.photos[0]} bodyType={car.body_type} sizes="(min-width: 1024px) 320px, 45vw" />
                    </div>
                    {car.status !== "available" && <StatusBadge status={car.status} className="mt-2" />}
                    <Link href={`/cars/${car.slug}`} className="font-wide mt-2 block leading-tight font-bold hover:underline">
                      {carTitle(car)}
                    </Link>
                    <span className="block text-muted">{car.variant}</span>
                    <CompareRemove slug={car.slug} title={`${carTitle(car)} ${car.variant}`} slugs={ids} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spec("Price", cars.map((car) => formatPeso(car.price_php)), "price", "Lowest")}
              {spec(
                "Monthly estimate",
                cars.map((car) => (car.status === "sold" ? "Sold" : `≈ ${formatPeso(estimateMonthly(car.price_php))}`)),
                "price",
                "Lowest",
              )}
              {spec("Year", cars.map((car) => String(car.year)), "year", "Newest")}
              {spec("Mileage", cars.map((car) => formatKm(car.mileage_km)), "mileage", "Lowest")}
              {spec("Transmission", cars.map((car) => TRANSMISSION_LABELS[car.transmission]))}
              {spec("Fuel", cars.map((car) => FUEL_LABELS[car.fuel]))}
              {spec("Body type", cars.map((car) => BODY_TYPE_LABELS[car.body_type]))}
              {spec("Colour", cars.map((car) => car.color || "Ask us"))}

              {featureUnion(cars).length > 0 && (
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={cars.length + 1}
                    className="border-b border-line bg-soft px-3 py-2 text-left text-xs font-semibold tracking-[0.12em] text-ink-2 uppercase"
                  >
                    Features
                  </th>
                </tr>
              )}
              {featureUnion(cars).map((feature) => {
                const has = cars.map((car) => car.features.includes(feature));
                return (
                  <Row
                    key={feature}
                    label={feature}
                    same={allSame(has)}
                    cells={has.map((yes, i) => (
                      <td key={ids[i]} className="border-b border-l border-line p-3">
                        {yes ? (
                          <Check aria-label="Yes" size={18} className="text-ok" />
                        ) : (
                          <Minus aria-label="No" size={18} className="text-muted" />
                        )}
                      </td>
                    ))}
                  />
                );
              })}

              <tr>
                <td className="sticky left-0 z-10 bg-paper" />
                {cars.map((car) => (
                  <td key={car.slug} className="border-l border-line p-3 align-top">
                    {car.status === "sold" ? (
                      <p className="text-muted">This car has been sold.</p>
                    ) : (
                      <Link
                        href={`/test-drive?car=${car.slug}`}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-field bg-signal px-3 font-semibold text-white hover:bg-signal-dark"
                      >
                        Book a test drive
                        <span className="sr-only"> for the {carTitle(car)}</span>
                      </Link>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Row({ label, same, cells }: { label: string; same: boolean; cells: ReactNode[] }) {
  return (
    <tr data-same={same || undefined}>
      <th
        scope="row"
        className="sticky left-0 z-10 w-28 border-b border-line bg-paper p-3 text-left align-top font-semibold text-ink-2 sm:w-40"
      >
        {label}
      </th>
      {cells}
    </tr>
  );
}

function Value({ best, word, children }: { best: boolean; word?: string; children: ReactNode }) {
  return (
    <td className={`border-b border-l border-line p-3 align-top tabular-nums ${best ? "bg-[#f1f9f5]" : ""}`}>
      <span className={best ? "font-semibold" : undefined}>{children}</span>
      {best && word && (
        <span className="mt-1 block w-fit rounded-full bg-[#e6f4ed] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-ok uppercase">
          {word}
        </span>
      )}
    </td>
  );
}
