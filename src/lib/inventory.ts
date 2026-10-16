import { BODY_TYPES, type BodyType, type Car } from "./types";

/** Cars a buyer can still act on. Sold cars stay on their detail page but leave search and counts. */
export function inStock(cars: Car[]) {
  return cars.filter((car) => car.status !== "sold");
}

export function newestFirst(cars: Car[]) {
  return [...cars].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export type BodyTypeSummary = {
  type: BodyType;
  count: number;
  fromPrice: number;
};

/** Only body types with at least one car. Fixes the original "Van: 0" dead end. */
export function bodyTypeSummaries(cars: Car[]): BodyTypeSummary[] {
  return BODY_TYPES.map((type) => {
    const matches = cars.filter((car) => car.body_type === type);
    return {
      type,
      count: matches.length,
      fromPrice: Math.min(...matches.map((car) => car.price_php)),
    };
  }).filter((summary) => summary.count > 0);
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
