"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { SORTS, type SortKey } from "@/lib/filters";
import { useFilterNav } from "./FilterNav";

export function SortSelect() {
  const { filters, update } = useFilterNav();
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm whitespace-nowrap text-muted">
        Sort by
      </label>
      <div className="relative">
        <select
          id={id}
          value={filters.sort}
          onChange={(event) => update({ sort: event.target.value as SortKey })}
          className="cursor-pointer appearance-none rounded-field border border-line bg-paper py-2 pr-9 pl-3 text-sm font-semibold"
        >
          {Object.entries(SORTS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}
