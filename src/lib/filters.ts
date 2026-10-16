import { z } from "zod";
import { formatPeso, formatPesoShort } from "./format";
import { inStock } from "./inventory";
import {
  BODY_TYPE_LABELS,
  BODY_TYPES,
  FUEL_LABELS,
  FUELS,
  TRANSMISSION_LABELS,
  TRANSMISSIONS,
  type Car,
} from "./types";

// ---------------------------------------------------------------------------
// Inventory filters live in the URL (?body=pickup&make=Ford&max=1000000).
// This file turns the URL into clean filters, applies them, and works out
// which options to offer next. Options with 0 cars are never offered.
// ---------------------------------------------------------------------------

export const SORTS = {
  newest: "Newest listings",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "mileage-asc": "Lowest mileage",
  "year-desc": "Newest model year",
} as const;
export type SortKey = keyof typeof SORTS;
const SORT_KEYS = Object.keys(SORTS) as [SortKey, ...SortKey[]];

export const PRICE_STEPS = [
  300_000, 500_000, 750_000, 1_000_000, 1_250_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000,
];
export const YEAR_STEPS = [2023, 2021, 2019, 2017, 2015, 2010];

// Invalid values (typos, old links, tampering) are dropped instead of erroring.
const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined);

const filtersSchema = z.object({
  body: optional(z.enum(BODY_TYPES)),
  make: optional(z.string().trim().min(1).max(40)),
  model: optional(z.string().trim().min(1).max(60)),
  min: optional(z.coerce.number().int().positive().max(100_000_000)),
  max: optional(z.coerce.number().int().positive().max(100_000_000)),
  year: optional(z.coerce.number().int().min(1950).max(2100)),
  trans: optional(z.enum(TRANSMISSIONS)),
  fuel: optional(z.enum(FUELS)),
  sort: z.enum(SORT_KEYS).catch("newest"),
});

export type Filters = z.infer<typeof filtersSchema>;
export type FilterKey = Exclude<keyof Filters, "sort">;

type RawParams = Record<string, string | string[] | undefined>;

export function parseFilters(raw: RawParams): Filters {
  const first = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  return normalizeFilters(filtersSchema.parse(first));
}

/** Fix impossible combinations: a model without a make, or min above max. */
export function normalizeFilters(filters: Filters): Filters {
  const next = { ...filters };
  if (!next.make) next.model = undefined;
  if (next.min && next.max && next.min > next.max) next.max = undefined;
  return next;
}

export function filtersToSearch(filters: Filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "") continue;
    if (key === "sort" && value === "newest") continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function inventoryHref(filters: Filters) {
  return `/inventory${filtersToSearch(normalizeFilters(filters))}`;
}

// ---------------------------------------------------------------------------
// Matching and sorting
// ---------------------------------------------------------------------------

const tests: Record<FilterKey, (car: Car, f: Filters) => boolean> = {
  body: (car, f) => !f.body || car.body_type === f.body,
  make: (car, f) => !f.make || car.make === f.make,
  model: (car, f) => !f.model || car.model === f.model,
  min: (car, f) => !f.min || car.price_php >= f.min,
  max: (car, f) => !f.max || car.price_php <= f.max,
  year: (car, f) => !f.year || car.year >= f.year,
  trans: (car, f) => !f.trans || car.transmission === f.trans,
  fuel: (car, f) => !f.fuel || car.fuel === f.fuel,
};
const FILTER_KEYS = Object.keys(tests) as FilterKey[];

function matching(cars: Car[], filters: Filters, ignore: FilterKey[] = []) {
  const active = FILTER_KEYS.filter((key) => !ignore.includes(key));
  return cars.filter((car) => active.every((key) => tests[key](car, filters)));
}

const sorters: Record<SortKey, (a: Car, b: Car) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  "price-asc": (a, b) => a.price_php - b.price_php,
  "price-desc": (a, b) => b.price_php - a.price_php,
  "mileage-asc": (a, b) => a.mileage_km - b.mileage_km,
  "year-desc": (a, b) => b.year - a.year || a.price_php - b.price_php,
};

/** In-stock cars that match every filter, in the chosen order. */
export function applyFilters(cars: Car[], filters: Filters) {
  return matching(inStock(cars), filters).sort(sorters[filters.sort]);
}

// ---------------------------------------------------------------------------
// Options ("facets"): each list is worked out with every OTHER filter applied,
// so picking an option can never lead to 0 results.
// ---------------------------------------------------------------------------

export type Option = { value: string; label: string; count: number };

function countBy(cars: Car[], key: (car: Car) => string, label: (value: string) => string) {
  const counts = new Map<string, number>();
  for (const car of cars) counts.set(key(car), (counts.get(key(car)) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, label: label(value), count }));
}

export type Facets = {
  body: Option[];
  make: Option[];
  model: Option[];
  min: Option[];
  max: Option[];
  year: Option[];
  trans: Option[];
  fuel: Option[];
};

export function getFacets(cars: Car[], filters: Filters): Facets {
  const stock = inStock(cars);
  const without = (...keys: FilterKey[]) => matching(stock, filters, keys);

  const body = countBy(without("body"), (c) => c.body_type, (v) => BODY_TYPE_LABELS[v as Car["body_type"]])
    .sort((a, b) => BODY_TYPES.indexOf(a.value as Car["body_type"]) - BODY_TYPES.indexOf(b.value as Car["body_type"]));

  const make = countBy(without("make", "model"), (c) => c.make, (v) => v).sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  // Models only make sense once a make is chosen (the original listed every model at once).
  const model = filters.make
    ? countBy(without("model"), (c) => c.model, (v) => v).sort((a, b) => a.label.localeCompare(b.label))
    : [];

  const forMin = without("min");
  const min = PRICE_STEPS.filter((step) => !filters.max || step < filters.max)
    .map((step) => ({
      value: String(step),
      label: formatPesoShort(step),
      count: forMin.filter((c) => c.price_php >= step).length,
    }))
    .filter((option) => option.count > 0);

  const forMax = without("max");
  const max = PRICE_STEPS.filter((step) => !filters.min || step > filters.min)
    .map((step) => ({
      value: String(step),
      label: formatPesoShort(step),
      count: forMax.filter((c) => c.price_php <= step).length,
    }))
    .filter((option) => option.count > 0);

  const forYear = without("year");
  const year = YEAR_STEPS.map((step) => ({
    value: String(step),
    label: `${step} or newer`,
    count: forYear.filter((c) => c.year >= step).length,
  })).filter((option) => option.count > 0);

  const trans = countBy(without("trans"), (c) => c.transmission, (v) => TRANSMISSION_LABELS[v as Car["transmission"]]);
  const fuel = countBy(without("fuel"), (c) => c.fuel, (v) => FUEL_LABELS[v as Car["fuel"]]);

  return { body, make, model, min, max, year, trans, fuel };
}

// ---------------------------------------------------------------------------
// Active filter chips ("Pickup ×") so each filter can be removed in one tap.
// ---------------------------------------------------------------------------

export type ActiveFilter = { key: FilterKey; label: string; href: string };

export function activeFilters(filters: Filters): ActiveFilter[] {
  const labels: Partial<Record<FilterKey, string>> = {
    body: filters.body && BODY_TYPE_LABELS[filters.body],
    make: filters.make,
    model: filters.model,
    min: filters.min ? `From ${formatPeso(filters.min)}` : undefined,
    max: filters.max ? `Up to ${formatPeso(filters.max)}` : undefined,
    year: filters.year ? `${filters.year} or newer` : undefined,
    trans: filters.trans && TRANSMISSION_LABELS[filters.trans],
    fuel: filters.fuel && FUEL_LABELS[filters.fuel],
  };

  return FILTER_KEYS.filter((key) => labels[key]).map((key) => ({
    key,
    label: labels[key]!,
    // Removing a make also removes its model.
    href: inventoryHref({ ...filters, [key]: undefined, ...(key === "make" ? { model: undefined } : {}) }),
  }));
}
