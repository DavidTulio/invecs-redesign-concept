"use client";

import { useSyncExternalStore } from "react";
import { toggleCompare } from "./compare";
import { createLocalList, isRecord } from "./local-list";

/** A picked car: enough to show in the compare bar without loading anything. */
export type CompareItem = { slug: string; title: string };

const store = createLocalList<CompareItem>(
  "invecs-compare",
  (item): item is CompareItem => isRecord(item) && typeof item.slug === "string" && typeof item.title === "string",
);
const EMPTY: CompareItem[] = [];

// Defined once, so components can safely list them as effect dependencies.
const actions = {
  toggle: (item: CompareItem) => store.write(toggleCompare(store.read(), item)),
  remove: (slug: string) => store.write(store.read().filter((item) => item.slug !== slug)),
  clear: () => store.write([]),
  /** Makes the saved list match the cars on the compare page (e.g. opened from a shared link). */
  replace: (items: CompareItem[]) => {
    if (JSON.stringify(items) !== JSON.stringify(store.read())) store.write(items);
  },
};

export function useCompare() {
  const list = useSyncExternalStore(store.subscribe, store.read, () => EMPTY);
  return { list, ...actions };
}
