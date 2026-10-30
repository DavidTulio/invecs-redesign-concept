import { describe, expect, it } from "vitest";
import { allSame, bestByRow, compareHref, featureUnion, parseCompareParam, toggleCompare } from "./compare";

const car = (slug: string, price_php: number, mileage_km: number, year: number) => ({ slug, price_php, mileage_km, year });

describe("parseCompareParam", () => {
  it("reads up to three valid slugs and drops repeats", () => {
    expect(parseCompareParam("a-1,b-2,a-1,c-3,d-4")).toEqual(["a-1", "b-2", "c-3"]);
  });

  it("ignores anything that isn't a slug", () => {
    expect(parseCompareParam("ok-car,<script>,../etc,,  ")).toEqual(["ok-car"]);
    expect(parseCompareParam(undefined)).toEqual([]);
  });

  it("accepts the parameter given twice", () => {
    expect(parseCompareParam(["a", "b"])).toEqual(["a", "b"]);
  });
});

describe("compareHref", () => {
  it("builds the shareable link", () => {
    expect(compareHref(["a", "b"])).toBe("/compare?cars=a,b");
    expect(compareHref([])).toBe("/compare");
  });
});

describe("toggleCompare", () => {
  const a = { slug: "a" }, b = { slug: "b" }, c = { slug: "c" }, d = { slug: "d" };

  it("adds and removes a car", () => {
    expect(toggleCompare([a], b)).toEqual([a, b]);
    expect(toggleCompare([a, b], a)).toEqual([b]);
  });

  it("refuses a fourth car", () => {
    expect(toggleCompare([a, b, c], d)).toEqual([a, b, c]);
  });
});

describe("bestByRow", () => {
  it("marks the lowest price, lowest mileage and newest year", () => {
    const best = bestByRow([car("x", 900_000, 40_000, 2019), car("y", 1_200_000, 12_000, 2022)]);
    expect([...best.price]).toEqual(["x"]);
    expect([...best.mileage]).toEqual(["y"]);
    expect([...best.year]).toEqual(["y"]);
  });

  it("marks every car that shares the best value", () => {
    const best = bestByRow([car("x", 900_000, 1, 2020), car("y", 900_000, 2, 2020), car("z", 1_000_000, 3, 2021)]);
    expect([...best.price].sort()).toEqual(["x", "y"]);
  });

  it("marks nothing when every car ties or there is only one car", () => {
    expect(bestByRow([car("x", 1, 1, 2020), car("y", 1, 1, 2020)]).price.size).toBe(0);
    expect(bestByRow([car("x", 1, 1, 2020)]).year.size).toBe(0);
  });
});

describe("allSame and featureUnion", () => {
  it("detects rows where every car matches", () => {
    expect(allSame(["Diesel", "Diesel"])).toBe(true);
    expect(allSame(["Diesel", "Gasoline"])).toBe(false);
  });

  it("lists every feature once, alphabetically", () => {
    expect(featureUnion([{ features: ["Sunroof", "ABS"] }, { features: ["ABS", "Cruise control"] }])).toEqual([
      "ABS",
      "Cruise control",
      "Sunroof",
    ]);
  });
});

describe("bestByRow with unknown mileage", () => {
  it("ignores cars without a stated mileage", () => {
    const best = bestByRow([
      { slug: "x", price_php: 1, mileage_km: null, year: 2020 },
      { slug: "y", price_php: 2, mileage_km: 50_000, year: 2020 },
      { slug: "z", price_php: 3, mileage_km: 30_000, year: 2020 },
    ]);
    expect([...best.mileage]).toEqual(["z"]);
  });

  it("marks nothing when only one car has a known mileage", () => {
    expect(bestByRow([{ slug: "x", price_php: 1, mileage_km: null, year: 2020 }, { slug: "y", price_php: 2, mileage_km: 9, year: 2020 }]).mileage.size).toBe(0);
  });
});
