"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useFilterNav } from "./FilterNav";

const TYPING_PAUSE_MS = 400;

/** One search box for the inventory. It's just another filter: ?q= in the URL. */
export function SearchBox() {
  const { filters, update } = useFilterNav();
  const [text, setText] = useState(filters.q ?? "");
  const [syncedQ, setSyncedQ] = useState(filters.q);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The search changed from outside (chip removed, back button): show it in the box.
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q);
    if ((filters.q ?? "") !== text.trim()) setText(filters.q ?? "");
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function search(value: string) {
    clearTimeout(timer.current);
    const q = value.trim() || undefined;
    if (q !== filters.q) update({ q });
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        search(text);
      }}
      className="relative"
    >
      <label htmlFor="inventory-search" className="sr-only">
        Search cars
      </label>
      <Search aria-hidden size={19} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
      <input
        id="inventory-search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        maxLength={80}
        value={text}
        placeholder="Search make, model or keyword"
        onChange={(event) => {
          const value = event.target.value;
          setText(value);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => search(value), TYPING_PAUSE_MS);
        }}
        className="min-h-12 w-full rounded-field border border-line bg-paper pr-12 pl-11 text-base placeholder:text-muted focus:border-ink [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            search("");
          }}
          className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-field text-muted hover:bg-soft hover:text-ink"
        >
          <X aria-hidden size={18} />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </form>
  );
}
