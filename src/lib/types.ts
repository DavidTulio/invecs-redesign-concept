// Shapes mirror the Supabase tables (snake_case columns).

export const BODY_TYPES = ["suv", "pickup", "sedan", "van"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  suv: "SUV / AUV",
  pickup: "Pickup",
  sedan: "Sedan",
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
  mileage_km: number;
  price_php: number;
  color: string;
  description: string;
  features: string[];
  status: CarStatus;
  created_at: string;
  /** Sorted by position; the first one is the cover photo. */
  photos: CarPhoto[];
};

export function carTitle(car: Pick<Car, "year" | "make" | "model">) {
  return `${car.year} ${car.make} ${car.model}`;
}
