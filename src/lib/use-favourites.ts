"use client";

import { useSyncExternalStore } from "react";
import { toggleFavourite, type Favourite } from "./favourites";
import { createLocalList, isRecord } from "./local-list";

const store = createLocalList<Favourite>(
  "invecs-favourites",
  (item): item is Favourite =>
    isRecord(item) &&
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.savedPrice === "number" &&
    typeof item.savedAt === "string",
);
const EMPTY: Favourite[] = [];

const actions = {
  toggle: (car: { slug: string; title: string; price: number }) =>
    store.write(
      toggleFavourite(store.read(), {
        slug: car.slug,
        title: car.title,
        savedPrice: car.price,
        savedAt: new Date().toISOString(),
      }),
    ),
  remove: (slug: string) => store.write(store.read().filter((item) => item.slug !== slug)),
  clear: () => store.write([]),
};

export function useFavourites() {
  const list = useSyncExternalStore(store.subscribe, store.read, () => EMPTY);
  return { list, ...actions };
}
