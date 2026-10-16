// Shapes mirror the planned Supabase tables (snake_case columns),
// so swapping the sample data for the database in Phase 2 is a small change.

export const BODY_TYPES = ["suv", "pickup", "sedan", "van"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  suv: "SUV / AUV",
  pickup: "Pickup",
  sedan: "Sedan",
  van: "Van",
};

export type Transmission = "automatic" | "manual";
export type Fuel = "diesel" | "gasoline" | "hybrid";
export type CarStatus = "available" | "reserved" | "sold";

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
};
