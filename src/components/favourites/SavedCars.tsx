"use client";

import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, X } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { CompareButton } from "@/components/compare/CompareButton";
import { COMPARE_MAX, compareHref } from "@/lib/compare";
import { priceChange } from "@/lib/favourites";
import { formatPeso } from "@/lib/format";
import { useFavourites } from "@/lib/use-favourites";
import { useHydrated } from "@/lib/use-hydrated";
import type { Car } from "@/lib/types";

/** The visitor's favourites, read from this browser and matched to the current stock. */
export function SavedCars({ cars }: { cars: Car[] }) {
  const hydrated = useHydrated();
  const { list, remove, clear } = useFavourites();

  if (!hydrated)
    return <p className="mt-6 text-muted">Loading your saved cars…</p>;

  if (list.length === 0) {
    return (
      <div className="mt-6 max-w-xl rounded-card border border-line p-6">
        <p className="font-semibold">No saved cars yet.</p>
        <p className="mt-1 text-muted">
          Tap the heart on any car to save it here. Saved cars stay on this
          device, and we&apos;ll show you if a price drops.
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

  const bySlug = new Map(cars.map((car) => [car.slug, car]));
  const gone = list.filter((item) => !bySlug.has(item.slug));
  const listed = list.filter((item) => bySlug.has(item.slug));
  // Two or three saved cars: compare them in one tap. More: pick them below each car.
  const compareAll = listed.length >= 2 && listed.length <= COMPARE_MAX;
  const pickToCompare = listed.length > COMPARE_MAX;

  return (
    <>
      <p className="mt-3 text-muted tabular-nums">
        {listed.length} saved {listed.length === 1 ? "car" : "cars"}, kept on
        this device only.
        {listed.length > COMPARE_MAX &&
          ` Pick up to ${COMPARE_MAX} with "Compare" to see them side by side.`}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {compareAll && (
          <Link
            href={compareHref(listed.map((item) => item.slug))}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-field bg-ink px-4 font-semibold text-white hover:bg-ink-2"
          >
            Compare {listed.length === 2 ? "both" : "all 3"}
            <ArrowRight aria-hidden size={16} />
          </Link>
        )}
        <button
          type="button"
          onClick={clear}
          className="min-h-11 px-1 text-sm font-semibold text-muted hover:text-ink"
        >
          Clear all
        </button>
      </div>

      <ul className="mt-6 grid gap-x-4 gap-y-6 [--tag-bg:var(--color-paper)] sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => {
          const car = bySlug.get(item.slug);
          if (!car) return null;
          const change = priceChange(item.savedPrice, car.price_php);
          const showRow = change || pickToCompare;
          return (
            <li key={item.slug} className="flex flex-col gap-2">
              <CarCard car={car} />
              {showRow && (
                <div className="flex min-h-10 items-center justify-between gap-3">
                  {change ? (
                    <p
                      className={`flex items-center gap-1.5 text-sm font-semibold tabular-nums ${
                        change.direction === "down" ? "text-ok" : "text-muted"
                      }`}
                    >
                      {change.direction === "down" ? (
                        <TrendingDown aria-hidden size={16} />
                      ) : (
                        <TrendingUp aria-hidden size={16} />
                      )}
                      {change.direction === "down" ? "Down" : "Up"}{" "}
                      {formatPeso(change.amount)} since you saved it
                    </p>
                  ) : (
                    <span />
                  )}
                  {pickToCompare && (
                    <CompareButton slug={car.slug} title={item.title} />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {gone.length > 0 && (
        <section aria-labelledby="gone-title" className="mt-10">
          <h2 id="gone-title" className="font-semibold">
            No longer listed
          </h2>
          <ul className="mt-3 grid gap-2">
            {gone.map((item) => (
              <li
                key={item.slug}
                className="flex items-center justify-between gap-3 rounded-field bg-soft py-2 pr-2 pl-4 text-sm"
              >
                <span className="min-w-0 truncate">{item.title}</span>
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-1 px-2 font-semibold text-muted hover:text-ink"
                >
                  <X aria-hidden size={14} />
                  Remove
                  <span className="sr-only">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
