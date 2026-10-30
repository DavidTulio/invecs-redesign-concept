// Shapes mirror the Supabase tables (snake_case columns).

export const BODY_TYPES = ["suv", "pickup", "sedan", "hatchback", "van"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  suv: "SUV / AUV",
  pickup: "Pickup",
  sedan: "Sedan",
  hatchback: "Hatchback",
  van: "Van",
};

export const TRANSMISSIONS = ["automatic", "manual"] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];
export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  automatic: "Automatic",
  manual: "Manual",
};

export const FUELS = ["diesel", "gasoline", "hybrid"] as const;
export type Fuel = (typeof FUELS)[number];
export const FUEL_LABELS: Record<Fuel, string> = {
  diesel: "Diesel",
  gasoline: "Gasoline",
  hybrid: "Hybrid",
};

export type CarStatus = "available" | "reserved" | "sold";

export type CarPhoto = {
  path: string;
  position: number;
  alt: string;
  credit_name: string | null;
  credit_url: string | null;
};

export type Car = {
  id: string;
  slug: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  body_type: BodyType;
  transmission: Transmission;
  fuel: Fuel;
  /** Null when the listing doesn't state it; shown as "Ask us". */
  mileage_km: number | null;
  price_php: number;
  color: string;
  description: string;
  features: string[];
  status: CarStatus;
  /** Shown first in the home page's "Latest arrivals" (staff choose up to 3). */
  featured: boolean;
  /** Storage path of the card image (a crop of the listing poster). Null → the first photo. */
  card_photo: string | null;
  /** The price printed in the listing photos, to flag when the real price has changed. */
  photo_price: number | null;
  created_at: string;
  /** Sorted by position; the first one opens the gallery. */
  photos: CarPhoto[];
};

/** The image for listing cards: the card crop if there is one, otherwise the first photo. */
export function cardPhoto(car: Pick<Car, "card_photo" | "photos" | "year" | "make" | "model" | "variant">): CarPhoto | undefined {
  if (!car.card_photo) return car.photos[0];
  return {
    path: car.card_photo,
    position: 0,
    alt: `${car.year} ${car.make} ${car.model} ${car.variant}`.trim(),
    credit_name: null,
    credit_url: null,
  };
}

export function carTitle(car: Pick<Car, "year" | "make" | "model">) {
  return `${car.year} ${car.make} ${car.model}`;
}
