import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { LOAN_DEFAULTS } from "@/lib/loan";
import type { Car } from "@/lib/types";

export function LatestArrivals({ cars, total }: { cars: Car[]; total: number }) {
  return (
    <section aria-labelledby="latest-title" className="section-y bg-soft">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h2 id="latest-title" className="section-title">
              Latest arrivals
            </h2>
            <p className="mt-1 max-w-[60ch] text-sm text-muted">
              Monthly estimates assume {LOAN_DEFAULTS.downPaymentPct}% down over{" "}
              {LOAN_DEFAULTS.termMonths} months at a sample {LOAN_DEFAULTS.annualRatePct}% yearly add-on
              rate. Estimate only; your bank sets the final terms.
            </p>
          </div>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 py-2 font-semibold text-signal hover:underline"
          >
            View all {total} cars
            <ArrowRight aria-hidden size={18} />
          </Link>
        </div>

        {/* Grey section: the price-tag notches take this background colour.
            Phones: one swipeable row (the next card peeks in), so six cars take one card's height.
            It runs edge to edge, then lines up with the page margin when it stops. */}
        <ul className="mt-6 grid gap-4 [--tag-bg:var(--color-soft)] max-sm:-mx-4 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-4 max-sm:overflow-x-auto max-sm:px-4 max-sm:pb-2 max-sm:[scrollbar-width:none] sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <li key={car.id} className="flex max-sm:w-[82%] max-sm:shrink-0 max-sm:snap-start">
              <CarCard car={car} showFeatured />
            </li>
          ))}
          {/* Phones: whoever swipes to the end wants more cars, so the next step waits there.
              Desktop shows the grid with the link above it in view, so it isn't needed. */}
          <li className="flex max-sm:w-[60%] max-sm:shrink-0 max-sm:snap-start sm:hidden">
            <Link
              href="/inventory"
              className="flex w-full flex-col items-center justify-center gap-3 rounded-card border border-line bg-paper p-6 text-center font-semibold text-signal hover:border-ink"
            >
              <span className="grid size-12 place-items-center rounded-full bg-soft">
                <ArrowRight aria-hidden size={22} />
              </span>
              View all {total} cars
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
