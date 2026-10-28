import { describe, expect, it } from "vitest";
import { latestArrivals } from "./inventory";
import type { Car } from "./types";

// Newest first, like getAllCars returns them.
const car = (slug: string, extra: Partial<Car> = {}) => ({ slug, status: "available", featured: false, ...extra }) as Car;

describe("latestArrivals", () => {
  const stock = ["a", "b", "c", "d", "e", "f", "g", "h"].map((slug) => car(slug));

  it("shows the 6 newest cars when nothing is featured", () => {
    expect(latestArrivals(stock).map((c) => c.slug)).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("puts featured cars first, then the newest of the rest", () => {
    const cars = stock.map((c) => (c.slug === "g" || c.slug === "d" ? { ...c, featured: true } : c));
    expect(latestArrivals(cars).map((c) => c.slug)).toEqual(["d", "g", "a", "b", "c", "e"]);
  });

  it("never shows a sold car, even if it's still marked featured", () => {
    const cars = stock.map((c) => (c.slug === "h" ? { ...c, featured: true, status: "sold" as const } : c));
    expect(latestArrivals(cars).map((c) => c.slug)).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("uses at most 3 featured spots", () => {
    const cars = stock.map((c) => ({ ...c, featured: ["b", "c", "e", "g"].includes(c.slug) }));
    expect(latestArrivals(cars).map((c) => c.slug)).toEqual(["b", "c", "e", "a", "d", "f"]);
  });
});
