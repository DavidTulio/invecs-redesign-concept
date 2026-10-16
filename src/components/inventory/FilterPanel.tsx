"use client";

import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SelectField } from "@/components/ui/SelectField";
import type { Facets, Filters, Option } from "@/lib/filters";
import { useFilterNav } from "./FilterNav";

type Field = Exclude<keyof Filters, "sort">;

/**
 * One filter panel for the whole inventory. Every dropdown only lists options
 * that still have cars, each with its count. On phones it folds behind a button.
 */
export function FilterPanel({
  facets,
  activeCount,
  resultCount,
}: {
  facets: Facets;
  activeCount: number;
  resultCount: number;
}) {
  const { filters, update } = useFilterNav();
  const [open, setOpen] = useState(false);

  const value = (field: Field) => (filters[field] === undefined ? "" : String(filters[field]));
  const set = (field: Field) => (next: string) =>
    update({
      [field]: next === "" ? undefined : next,
      // A new make means its old model no longer applies.
      ...(field === "make" ? { model: undefined } : {}),
    });

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-field border border-line px-4 py-3 font-semibold lg:hidden"
        aria-expanded={open}
        aria-controls="filter-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden size={18} />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-signal px-2 py-0.5 text-xs text-white tabular-nums">
              {activeCount}
            </span>
          )}
        </span>
        <span className="text-sm font-normal text-muted">{open ? "Hide" : "Show"}</span>
      </button>

      <form
        id="filter-panel"
        aria-label="Filter cars"
        onSubmit={(event) => event.preventDefault()}
        className={`${open ? "grid" : "hidden"} mt-3 gap-3 lg:mt-0 lg:grid`}
      >
        <div className="hidden items-center justify-between lg:flex">
          <h2 className="font-wide text-lg font-bold">Filters</h2>
          {activeCount > 0 && (
            <Link href="/inventory" scroll={false} className="text-sm font-semibold text-signal hover:underline">
              Clear all
            </Link>
          )}
        </div>

        <FacetSelect label="Body type" name="body" anyLabel="Any body type" options={facets.body} value={value("body")} onChange={set("body")} />
        <FacetSelect label="Make" name="make" anyLabel="Any make" options={facets.make} value={value("make")} onChange={set("make")} />
        <FacetSelect
          label="Model"
          name="model"
          anyLabel={filters.make ? `Any ${filters.make} model` : "Choose a make first"}
          options={facets.model}
          value={value("model")}
          onChange={set("model")}
          disabled={!filters.make}
        />

        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">Price range</legend>
          <FacetSelect label="Min price" name="min" anyLabel="No min" options={facets.min} value={value("min")} onChange={set("min")} />
          <FacetSelect label="Max price" name="max" anyLabel="No max" options={facets.max} value={value("max")} onChange={set("max")} />
        </fieldset>

        <FacetSelect label="Year" name="year" anyLabel="Any year" options={facets.year} value={value("year")} onChange={set("year")} />
        <FacetSelect label="Transmission" name="trans" anyLabel="Any transmission" options={facets.trans} value={value("trans")} onChange={set("trans")} />
        <FacetSelect label="Fuel" name="fuel" anyLabel="Any fuel" options={facets.fuel} value={value("fuel")} onChange={set("fuel")} />

        {/* Phones: close the panel and jump to the results. */}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            document.getElementById("results-title")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="rounded-field bg-signal px-4 py-3 font-semibold text-white tabular-nums hover:bg-signal-dark lg:hidden"
        >
          Show {resultCount} {resultCount === 1 ? "car" : "cars"}
        </button>

        {activeCount > 0 && (
          <Link
            href="/inventory"
            scroll={false}
            className="flex items-center justify-center gap-1.5 rounded-field py-2.5 text-sm font-semibold text-signal hover:underline lg:hidden"
          >
            <X aria-hidden size={16} />
            Clear all filters
          </Link>
        )}
      </form>
    </div>
  );
}

function FacetSelect({
  label,
  name,
  anyLabel,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  anyLabel: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  // If the URL holds a value with no matching cars (an old or edited link), still show it
  // so the control matches the results. The chips above the results let the visitor remove it.
  const missing = value && !options.some((option) => option.value === value);

  return (
    <SelectField label={label} name={name} value={value} onChange={onChange} disabled={disabled} bordered>
      <option value="">{anyLabel}</option>
      {missing && <option value={value}>{value} (0)</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label} ({option.count})
        </option>
      ))}
    </SelectField>
  );
}
