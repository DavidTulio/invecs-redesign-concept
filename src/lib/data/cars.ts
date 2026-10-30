import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Car, CarPhoto } from "@/lib/types";

/** Admin actions call updateTag(CARS_TAG) so visitors see changes right away. */
export const CARS_TAG = "cars";

const CAR_COLUMNS = `
  id, slug, make, model, variant, year, body_type, transmission, fuel,
  mileage_km, price_php, color, description, features, status, featured, card_photo, photo_price, created_at,
  car_photos ( path, position, alt, credit_name, credit_url )
`;

type CarRow = Omit<Car, "photos"> & { car_photos: CarPhoto[] };

// Supabase returns at most 1,000 rows per request, so bigger stocks are read in batches.
const BATCH_SIZE = 1_000;

/**
 * Every car, newest first, with photos sorted by position.
 * A dealer's stock is tens to hundreds of cars, so we load it once, cache it,
 * and filter in memory. That also lets each filter show live counts.
 * Pages only send visitors what they show (12 cars at a time, or just the saved ones).
 */
export async function getAllCars(): Promise<Car[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CARS_TAG);

  const supabase = createPublicClient();
  const rows: CarRow[] = [];
  for (let from = 0; ; from += BATCH_SIZE) {
    const { data, error } = await supabase
      .from("cars")
      .select(CAR_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id") // a stable order, so no car is skipped or repeated between batches
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw new Error(`Could not load cars: ${error.message}`);
    rows.push(...(data as unknown as CarRow[]));
    if (data.length < BATCH_SIZE) break;
  }

  return rows.map(({ car_photos, ...car }) => ({
    ...car,
    photos: [...car_photos].sort((a, b) => a.position - b.position),
  }));
}

export async function getCarBySlug(slug: string) {
  const cars = await getAllCars();
  return cars.find((car) => car.slug === slug) ?? null;
}
