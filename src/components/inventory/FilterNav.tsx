"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useOptimistic, useTransition, type ReactNode } from "react";
import { inventoryHref, normalizeFilters, type Filters } from "@/lib/filters";

type FilterNav = {
  /** Filters as the visitor last set them, even before the new page arrives. */
  filters: Filters;
  pending: boolean;
  update: (patch: Partial<Filters>) => void;
};

const FilterNavContext = createContext<FilterNav | null>(null);

/**
 * Shares one navigation state between the filter panel, the sort menu and the results.
 * The URL stays the single source of truth: every change is a new URL, so links can be
 * shared and the back button works. useOptimistic makes the controls update instantly.
 */
export function FilterNavProvider({ filters, children }: { filters: Filters; children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(filters);

  function update(patch: Partial<Filters>) {
    const next = normalizeFilters({ ...optimistic, ...patch });
    startTransition(() => {
      setOptimistic(next);
      router.push(inventoryHref(next), { scroll: false });
    });
  }

  return (
    <FilterNavContext value={{ filters: optimistic, pending, update }}>{children}</FilterNavContext>
  );
}

export function useFilterNav() {
  const context = use(FilterNavContext);
  if (!context) throw new Error("useFilterNav must be used inside <FilterNavProvider>");
  return context;
}

/** Dims the results while new ones load, and tells screen readers they're updating. */
export function ResultsRegion({ children }: { children: ReactNode }) {
  const { pending } = useFilterNav();
  return (
    <div aria-busy={pending} className={`transition-opacity ${pending ? "opacity-50" : ""}`}>
      {children}
    </div>
  );
}
