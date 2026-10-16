import { BODY_TYPES, type BodyType, type Car } from "./types";

/** Cars a buyer can still act on. Sold cars keep their page but leave search and counts. */
export function inStock(cars: Car[]) {
  return cars.filter((car) => car.status !== "sold");
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

/**
 * Up to `limit` other in-stock cars of the same body type: available before reserved,
 * then closest in price. Falls back to any body type if there aren't enough.
 */
export function similarCars(car: Car, cars: Car[], limit = 3) {
  const reserved = (c: Car) => Number(c.status === "reserved");
  const priceGap = (c: Car) => Math.abs(c.price_php - car.price_php);
  const rank = (a: Car, b: Car) => reserved(a) - reserved(b) || priceGap(a) - priceGap(b);
  const others = inStock(cars).filter((other) => other.id !== car.id);
  const sameType = others.filter((other) => other.body_type === car.body_type).sort(rank);
  const rest = others.filter((other) => other.body_type !== car.body_type).sort(rank);
  return [...sameType, ...rest].slice(0, limit);
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
