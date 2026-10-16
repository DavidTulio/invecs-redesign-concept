import { describe, expect, it } from "vitest";
import { activeFilters, applyFilters, getFacets, inventoryHref, parseFilters } from "./filters";
import type { Car } from "./types";

let id = 0;
function car(overrides: Partial<Car>): Car {
  id += 1;
  return {
    id: String(id),
    slug: `car-${id}`,
    make: "Toyota",
    model: "Vios",
    variant: "",
    year: 2020,
    body_type: "sedan",
    transmission: "automatic",
    fuel: "gasoline",
    mileage_km: 50_000,
    price_php: 500_000,
    color: "",
    description: "",
    features: [],
    status: "available",
    created_at: `2026-10-${String(id).padStart(2, "0")}T00:00:00Z`,
    photos: [],
    ...overrides,
  };
}

const cars = [
  car({ make: "Toyota", model: "Hilux", body_type: "pickup", price_php: 1_500_000, fuel: "diesel" }),
  car({ make: "Ford", model: "Ranger", body_type: "pickup", price_php: 900_000, fuel: "diesel" }),
  car({ make: "Ford", model: "Everest", body_type: "suv", price_php: 1_300_000, fuel: "diesel" }),
  car({ make: "Toyota", model: "Vios", body_type: "sedan", price_php: 450_000 }),
  car({ make: "Nissan", model: "Navara", body_type: "pickup", price_php: 1_100_000, status: "sold" }),
];

describe("parseFilters", () => {
  it("reads valid values from the URL", () => {
    expect(parseFilters({ body: "pickup", make: "Ford", max: "1000000" })).toMatchObject({
      body: "pickup",
      make: "Ford",
      max: 1_000_000,
      sort: "newest",
    });
  });

  it("drops invalid or tampered values instead of crashing", () => {
    const filters = parseFilters({ body: "spaceship", min: "-5", year: "abc", sort: "random" });
    expect(filters.body).toBeUndefined();
    expect(filters.min).toBeUndefined();
    expect(filters.year).toBeUndefined();
    expect(filters.sort).toBe("newest");
  });

  it("ignores a model without a make", () => {
    expect(parseFilters({ model: "Hilux" }).model).toBeUndefined();
  });

  it("ignores a max price below the min price", () => {
    const filters = parseFilters({ min: "1000000", max: "500000" });
    expect(filters.min).toBe(1_000_000);
    expect(filters.max).toBeUndefined();
  });
});

describe("applyFilters", () => {
  it("never shows sold cars", () => {
    expect(applyFilters(cars, parseFilters({})).map((c) => c.model)).not.toContain("Navara");
  });

  it("combines filters and sorts by price", () => {
    const result = applyFilters(cars, parseFilters({ body: "pickup", sort: "price-asc" }));
    expect(result.map((c) => c.model)).toEqual(["Ranger", "Hilux"]);
  });
});

describe("getFacets", () => {
  it("only offers body types and makes that have cars", () => {
    const facets = getFacets(cars, parseFilters({}));
    expect(facets.body.map((o) => o.value)).toEqual(["suv", "pickup", "sedan"]); // no van
    expect(facets.make.map((o) => o.value)).not.toContain("Nissan"); // only a sold car
  });

  it("links models to the chosen make", () => {
    expect(getFacets(cars, parseFilters({})).model).toEqual([]);
    const fordModels = getFacets(cars, parseFilters({ make: "Ford" })).model.map((o) => o.value);
    expect(fordModels).toEqual(["Everest", "Ranger"]);
  });

  it("never offers a max price below the chosen min", () => {
    const facets = getFacets(cars, parseFilters({ min: "1000000" }));
    expect(facets.max.every((o) => Number(o.value) > 1_000_000)).toBe(true);
  });
});

describe("activeFilters", () => {
  it("removing the make also removes its model", () => {
    const chips = activeFilters(parseFilters({ make: "Ford", model: "Ranger" }));
    expect(chips.find((c) => c.key === "make")?.href).toBe("/inventory");
  });

  it("builds clean URLs", () => {
    expect(inventoryHref(parseFilters({ body: "suv", sort: "newest" }))).toBe("/inventory?body=suv");
  });
});
