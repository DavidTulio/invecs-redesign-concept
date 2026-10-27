import type { Car } from "@/lib/types";

// Compare up to three cars side by side. Three is what fits on a phone screen.
export const COMPARE_MAX = 3;

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "?cars=a,b,c" → ["a", "b", "c"]: valid slugs only, no repeats, at most three. */
export function parseCompareParam(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  const slugs = raw
    .split(",")
    .map((slug) => slug.trim().toLowerCase())
    .filter((slug) => slug.length <= 120 && SLUG.test(slug));
  return [...new Set(slugs)].slice(0, COMPARE_MAX);
}

export function compareHref(slugs: string[]) {
  return slugs.length ? `/compare?cars=${slugs.join(",")}` : "/compare";
}

/** Adds the car, or removes it if it's already picked. A fourth car is refused. */
export function toggleCompare<T extends { slug: string }>(list: T[], item: T): T[] {
  if (list.some((entry) => entry.slug === item.slug)) return list.filter((entry) => entry.slug !== item.slug);
  return list.length >= COMPARE_MAX ? list : [...list, item];
}

export type BestKey = "price" | "mileage" | "year";

/**
 * Which cars win each row: lowest price, lowest mileage, newest year.
 * A row has no winner when there's only one car or every car ties.
 */
export function bestByRow(cars: Pick<Car, "slug" | "price_php" | "mileage_km" | "year">[]) {
  const pick = (value: (car: (typeof cars)[number]) => number, want: "min" | "max") => {
    const values = cars.map(value);
    const target = want === "min" ? Math.min(...values) : Math.max(...values);
    const winners = cars.filter((car) => value(car) === target).map((car) => car.slug);
    return cars.length > 1 && winners.length < cars.length ? new Set(winners) : new Set<string>();
  };
  return {
    price: pick((car) => car.price_php, "min"),
    mileage: pick((car) => car.mileage_km, "min"),
    year: pick((car) => car.year, "max"),
  } satisfies Record<BestKey, Set<string>>;
}

/** True when every car shows the same value, so "Show only differences" can hide the row. */
export function allSame(values: unknown[]) {
  return values.every((value) => value === values[0]);
}

/** Every feature any of the cars has, in a stable order, for the ✓ / – rows. */
export function featureUnion(cars: Pick<Car, "features">[]) {
  return [...new Set(cars.flatMap((car) => car.features))].sort((a, b) => a.localeCompare(b));
}
