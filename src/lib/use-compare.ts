"use client";

import { useSyncExternalStore } from "react";
import { toggleCompare } from "./compare";

/** A picked car: enough to show in the compare bar without loading anything. */
export type CompareItem = { slug: string; title: string };

// Saved only in this browser. If storage is blocked (private mode), comparing
// still works for the current page, it just isn't remembered.
const KEY = "invecs-compare";
const EVENT = "invecs-compare-change";
const EMPTY: CompareItem[] = [];

let cachedRaw: string | null = null;
let cachedList: CompareItem[] = EMPTY;
let memory: string | null = null;

function readRaw() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}

function read(): CompareItem[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(parsed)
      ? parsed.filter((item): item is CompareItem => typeof item?.slug === "string" && typeof item?.title === "string")
      : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

function write(list: CompareItem[]) {
  const raw = JSON.stringify(list);
  memory = raw;
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    // Storage blocked: keep it in memory for this page.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // picks made in another tab
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Defined once, so components can safely list them as effect dependencies.
const actions = {
  toggle: (item: CompareItem) => write(toggleCompare(read(), item)),
  remove: (slug: string) => write(read().filter((item) => item.slug !== slug)),
  clear: () => write([]),
  /** Makes the saved list match the cars on the compare page (e.g. opened from a shared link). */
  replace: (items: CompareItem[]) => {
    if (JSON.stringify(items) !== JSON.stringify(read())) write(items);
  },
};

export function useCompare() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  return { list, ...actions };
}
