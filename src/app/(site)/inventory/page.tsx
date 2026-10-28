import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { X } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { FilterNavProvider, ResultsRegion } from "@/components/inventory/FilterNav";
import { FilterPanel } from "@/components/inventory/FilterPanel";
import { SearchBox } from "@/components/inventory/SearchBox";
import { SortSelect } from "@/components/inventory/SortSelect";
import { getAllCars } from "@/lib/data/cars";
import { activeFilters, applyFilters, getFacets, inventoryHref, parseFilters, searchSuggestions } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Cars for sale",
  description: "Browse used and nearly-new SUVs, pickups and sedans with full prices and monthly estimates.",
};

export default function InventoryPage({ searchParams }: PageProps<"/inventory">) {
  return (
    <div className="container-site py-8 sm:py-12">
      <h1 className="font-wide text-3xl font-extrabold sm:text-4xl">Cars for sale</h1>
      {/* The heading ships instantly; results stream in once the URL's filters are read. */}
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function InventoryResults({ searchParams }: Pick<PageProps<"/inventory">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  const cars = await getAllCars();
  const results = applyFilters(cars, filters);
  const facets = getFacets(cars, filters);
  const chips = activeFilters(filters);
  const suggestions = results.length === 0 && filters.q ? searchSuggestions(cars, filters) : [];

  return (
    <FilterNavProvider filters={filters}>
      <div className="mt-6 max-w-2xl">
        <SearchBox />
      </div>
      <div className="mt-5 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        <aside aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
          <FilterPanel facets={facets} activeCount={chips.length} resultCount={results.length} />
        </aside>

        <section aria-labelledby="results-title" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-title" aria-live="polite" className="text-lg font-semibold tabular-nums">
              {results.length} {results.length === 1 ? "car" : "cars"}
              {chips.length === 0 ? " in stock" : results.length === 1 ? " matches" : " match"}
            </h2>
            <SortSelect />
          </div>

          {chips.length > 0 && (
            <ul aria-label="Active filters" className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <Link
                    href={chip.href}
                    scroll={false}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-soft py-1.5 pr-2.5 pl-3 text-sm hover:border-ink"
                  >
                    {chip.label}
                    <X aria-hidden size={14} />
                    <span className="sr-only">(remove filter)</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <ResultsRegion>
            {results.length > 0 ? (
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((car, index) => (
                  <li key={car.id} className="flex">
                    <CarCard car={car} preload={index < 2} />
                  </li>
                ))}
              </ul>
            ) : filters.q ? (
              <>
                <div className="mt-5 rounded-card border border-dashed border-line p-8 text-center">
                  <p className="font-semibold break-words">No cars match &ldquo;{filters.q}&rdquo;{chips.length > 1 ? " with these filters" : ""}.</p>
                  <p className="mt-1 text-sm text-muted">Try fewer or different words, like a make or model.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Link
                      href={inventoryHref({ ...filters, q: undefined })}
                      scroll={false}
                      className="rounded-field bg-ink px-4 py-2.5 font-semibold text-white hover:bg-ink-2"
                    >
                      Clear search
                    </Link>
                    <Link href="/inventory" className="rounded-field border border-line px-4 py-2.5 font-semibold hover:border-ink">
                      Show all cars
                    </Link>
                  </div>
                </div>
                {suggestions.length > 0 && (
                  <section aria-labelledby="suggestions-title" className="mt-8">
                    <h3 id="suggestions-title" className="font-semibold">
                      You might like
                    </h3>
                    <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {suggestions.map((car) => (
                        <li key={car.id} className="flex">
                          <CarCard car={car} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            ) : (
              <div className="mt-5 rounded-card border border-dashed border-line p-8 text-center">
                <p className="font-semibold">No cars match all of these filters.</p>
                <p className="mt-1 text-sm text-muted">Remove a filter above, or start over.</p>
                <Link
                  href="/inventory"
                  className="mt-4 inline-block rounded-field bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark"
                >
                  Show all cars
                </Link>
              </div>
            )}
          </ResultsRegion>
        </section>
      </div>
    </FilterNavProvider>
  );
}

function InventorySkeleton() {
  return (
    <>
      <div className="mt-6 h-12 max-w-2xl rounded-field bg-soft" aria-hidden />
      <div className="mt-5 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10" aria-hidden>
        <div className="h-12 rounded-field bg-soft lg:h-[30rem]" />
        <div>
          <div className="h-7 w-40 rounded bg-soft" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-[4/3.6] rounded-card bg-soft" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
