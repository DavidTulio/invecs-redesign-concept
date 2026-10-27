"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavourites } from "@/lib/use-favourites";

/** Header link to the Saved page, with the number of saved cars. */
export function SavedLink() {
  const { list } = useFavourites();
  const count = list.length;
  return (
    <Link
      href="/saved"
      className="relative grid size-11 place-items-center rounded-field text-ink hover:bg-soft"
    >
      <Heart aria-hidden size={21} className={count ? "fill-signal text-signal" : undefined} />
      <span className="sr-only">Saved cars{count ? ` (${count})` : ""}</span>
      {count > 0 && (
        <span
          aria-hidden
          className="absolute top-1 right-0.5 grid min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[11px] leading-[18px] font-semibold text-white tabular-nums"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
