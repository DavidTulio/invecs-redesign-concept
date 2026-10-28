"use server";

import { getAllCars } from "@/lib/data/cars";
import type { Car } from "@/lib/types";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_SLUGS = 100;

/**
 * The cars a visitor saved, for the Saved page, so the browser never downloads the
 * whole stock. Public and read-only: it only returns cars anyone can already see.
 * Anything that isn't a list of car names is ignored.
 */
export async function getSavedCars(slugs: unknown): Promise<Car[]> {
  if (!Array.isArray(slugs)) return [];
  const wanted = new Set(
    slugs
      .filter((slug): slug is string => typeof slug === "string" && slug.length <= 120 && SLUG.test(slug))
      .slice(0, MAX_SLUGS),
  );
  if (wanted.size === 0) return [];

  const cars = await getAllCars();
  // Long descriptions aren't shown on cards, so they aren't sent.
  return cars.filter((car) => wanted.has(car.slug)).map((car) => ({ ...car, description: "" }));
}
