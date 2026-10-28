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

        {/* Grey section: the price-tag notches take this background colour. */}
        <ul className="mt-6 grid gap-4 [--tag-bg:var(--color-soft)] sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <li key={car.id} className="flex">
              <CarCard car={car} showFeatured />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
