import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Car, CarPhoto } from "@/lib/types";

/** Admin actions call updateTag(CARS_TAG) so visitors see changes right away. */
export const CARS_TAG = "cars";

const CAR_COLUMNS = `
  id, slug, make, model, variant, year, body_type, transmission, fuel,
  mileage_km, price_php, color, description, features, status, created_at,
  car_photos ( path, position, alt, credit_name, credit_url )
`;

type CarRow = Omit<Car, "photos"> & { car_photos: CarPhoto[] };

/**
 * Every car, newest first, with photos sorted by position.
 * The whole inventory is small (tens of cars), so we load it once, cache it,
 * and filter in memory. That also lets each filter show live counts.
 */
export async function getAllCars(): Promise<Car[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CARS_TAG);

  const { data, error } = await createPublicClient()
    .from("cars")
    .select(CAR_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load cars: ${error.message}`);

  return (data as unknown as CarRow[]).map(({ car_photos, ...car }) => ({
    ...car,
    photos: [...car_photos].sort((a, b) => a.position - b.position),
  }));
}

export async function getCarBySlug(slug: string) {
  const cars = await getAllCars();
  return cars.find((car) => car.slug === slug) ?? null;
}
