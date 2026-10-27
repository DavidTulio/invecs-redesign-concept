import { describe, expect, it } from "vitest";
import { priceChange, toggleFavourite, type Favourite } from "./favourites";

const fav = (slug: string): Favourite => ({ slug, title: slug, savedPrice: 1_000_000, savedAt: "2026-10-27T00:00:00Z" });

describe("toggleFavourite", () => {
  it("adds new favourites to the top and removes saved ones", () => {
    const a = fav("a"), b = fav("b");
    expect(toggleFavourite([a], b)).toEqual([b, a]);
    expect(toggleFavourite([b, a], a)).toEqual([b]);
  });
});

describe("priceChange", () => {
  it("reports a drop and a rise with the amount", () => {
    expect(priceChange(1_200_000, 1_150_000)).toEqual({ direction: "down", amount: 50_000 });
    expect(priceChange(1_200_000, 1_230_000)).toEqual({ direction: "up", amount: 30_000 });
  });

  it("reports nothing when the price is the same", () => {
    expect(priceChange(1_200_000, 1_200_000)).toBeNull();
  });
});
