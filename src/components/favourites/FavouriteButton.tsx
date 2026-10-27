"use client";

import { Heart } from "lucide-react";
import { useFavourites } from "@/lib/use-favourites";
import { useHydrated } from "@/lib/use-hydrated";

/** Saves a car to (or removes it from) the visitor's favourites. */
export function FavouriteButton({
  slug,
  title,
  price,
  variant = "card",
}: {
  slug: string;
  title: string;
  price: number;
  variant?: "card" | "page";
}) {
  const hydrated = useHydrated();
  const { list, toggle } = useFavourites();
  const saved = list.some((item) => item.slug === slug);
  const icon = <Heart aria-hidden size={variant === "card" ? 17 : 18} className={saved ? "fill-signal text-signal" : undefined} />;

  if (variant === "card") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        disabled={!hydrated}
        onClick={() => toggle({ slug, title, price })}
        className="relative z-10 grid size-9 place-items-center rounded-full bg-paper/95 text-ink shadow-[0_1px_3px_rgb(14_26_43/0.2)] transition-colors hover:bg-paper disabled:opacity-60"
      >
        {icon}
        <span className="sr-only">Save {title}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      disabled={!hydrated}
      onClick={() => toggle({ slug, title, price })}
      className="inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-field border border-line px-4 font-semibold transition-colors hover:border-ink disabled:opacity-60"
    >
      {icon}
      {saved ? "Saved" : "Save"}
      <span className="sr-only">{title}</span>
    </button>
  );
}
