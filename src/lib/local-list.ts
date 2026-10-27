"use client";

// A list saved only in this browser (compare picks, favourites). If storage is
// blocked (some private modes), the list still works until the page is left.

type Store<T> = {
  /** Current list; the same array until it changes, as useSyncExternalStore needs. */
  read: () => T[];
  write: (list: T[]) => void;
  subscribe: (onChange: () => void) => () => void;
};

export function createLocalList<T>(key: string, isItem: (value: unknown) => value is T): Store<T> {
  const event = `${key}-change`;
  const empty: T[] = [];
  let cachedRaw: string | null = null;
  let cachedList: T[] = empty;
  let memory: string | null = null;

  const readRaw = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory;
    }
  };

  return {
    read() {
      const raw = readRaw();
      if (raw === cachedRaw) return cachedList;
      cachedRaw = raw;
      try {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        cachedList = Array.isArray(parsed) ? parsed.filter(isItem) : empty;
      } catch {
        cachedList = empty;
      }
      return cachedList;
    },
    write(list) {
      const raw = JSON.stringify(list);
      memory = raw;
      try {
        localStorage.setItem(key, raw);
      } catch {
        // Storage blocked: keep it in memory for this page.
      }
      window.dispatchEvent(new Event(event));
    },
    subscribe(onChange) {
      window.addEventListener(event, onChange);
      window.addEventListener("storage", onChange); // changes made in another tab
      return () => {
        window.removeEventListener(event, onChange);
        window.removeEventListener("storage", onChange);
      };
    },
  };
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
