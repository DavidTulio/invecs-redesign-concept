import { describe, expect, it } from "vitest";
import { makeCarSchema, sniffImageType } from "./car-schema";

const schema = makeCarSchema(new Date("2026-10-16T00:00:00Z"));

const valid = {
  make: "Toyota",
  model: "Fortuner",
  variant: "2.8 V 4x4",
  year: "2021",
  body_type: "suv",
  transmission: "automatic",
  fuel: "diesel",
  mileage_km: "38,000",
  price_php: "₱1,650,000",
  color: "Pearl White",
  description: "Well kept.",
  features: "- 7 seats\n• Reverse camera\n\n  Power tailgate  ",
  status: "available",
};

describe("car schema", () => {
  it("accepts a normal car and cleans up numbers and features", () => {
    const car = schema.parse(valid);
    expect(car.price_php).toBe(1_650_000);
    expect(car.mileage_km).toBe(38_000);
    expect(car.year).toBe(2021);
    expect(car.features).toEqual(["7 seats", "Reverse camera", "Power tailgate"]);
  });

  it.each([
    ["a missing make", { make: " " }],
    ["a future model year", { year: "2030" }],
    ["a decimal price", { price_php: "1000000.50" }],
    ["a negative mileage", { mileage_km: "-5" }],
    ["an unknown body type", { body_type: "spaceship" }],
    ["an unknown status", { status: "stolen" }],
    ["too many features", { features: Array.from({ length: 41 }, (_, i) => `Feature ${i}`).join("\n") }],
  ])("rejects %s", (_, patch) => {
    expect(schema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it("allows next year's model (cars are sold before their model year)", () => {
    expect(schema.safeParse({ ...valid, year: "2027" }).success).toBe(true);
  });
});

describe("sniffImageType", () => {
  const bytes = (...values: number[]) => new Uint8Array([...values, ...new Array(16).fill(0)]);
  const text = (s: string) => [...s].map((c) => c.charCodeAt(0));

  it("recognises JPEG, PNG and WebP by their first bytes", () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe("image/jpeg");
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe("image/png");
    expect(sniffImageType(bytes(...text("RIFF"), 0, 0, 0, 0, ...text("WEBP")))?.mime).toBe("image/webp");
  });

  it("rejects other files even if they are named .jpg", () => {
    expect(sniffImageType(bytes(...text("<svg")))).toBeNull(); // SVG can carry scripts
    expect(sniffImageType(bytes(...text("%PDF")))).toBeNull();
    expect(sniffImageType(bytes(...text("GIF89a")))).toBeNull();
  });
});

describe("optional mileage", () => {
  const base = {
    make: "Toyota", model: "Vios", variant: "", year: "2015", body_type: "sedan", transmission: "manual",
    fuel: "gasoline", price_php: "260,000", color: "", description: "", features: "", status: "available", featured: "",
  };
  it("accepts an empty mileage as unknown", () => {
    expect(makeCarSchema().parse({ ...base, mileage_km: "" }).mileage_km).toBeNull();
  });
  it("still reads a typed mileage", () => {
    expect(makeCarSchema().parse({ ...base, mileage_km: "77,300" }).mileage_km).toBe(77_300);
  });
});
