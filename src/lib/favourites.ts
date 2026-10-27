// Favourites remember the price when a car was saved, so the Saved page can say
// "↓ ₱50,000 since you saved it". Pure helpers here; the browser storage is in use-favourites.

export type Favourite = { slug: string; title: string; savedPrice: number; savedAt: string };

/** Adds the car, or removes it if it's already saved. Newest first. */
export function toggleFavourite(list: Favourite[], item: Favourite): Favourite[] {
  return list.some((entry) => entry.slug === item.slug)
    ? list.filter((entry) => entry.slug !== item.slug)
    : [item, ...list];
}

export type PriceChange = { direction: "down" | "up"; amount: number } | null;

/** How the price moved since the car was saved; null when it hasn't changed. */
export function priceChange(savedPrice: number, currentPrice: number): PriceChange {
  const difference = currentPrice - savedPrice;
  if (difference === 0 || !Number.isFinite(difference)) return null;
  return { direction: difference < 0 ? "down" : "up", amount: Math.abs(difference) };
}
