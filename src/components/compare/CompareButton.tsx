"use client";

import { Check, Plus } from "lucide-react";
import { COMPARE_MAX } from "@/lib/compare";
import { useCompare } from "@/lib/use-compare";
import { useHydrated } from "@/lib/use-hydrated";

/** Adds a car to (or removes it from) the comparison. */
export function CompareButton({
  slug,
  title,
  variant = "card",
}: {
  slug: string;
  title: string;
  variant?: "card" | "page";
}) {
  const hydrated = useHydrated();
  const { list, toggle } = useCompare();
  const picked = list.some((item) => item.slug === slug);
  const full = !picked && list.length >= COMPARE_MAX;

  const look =
    variant === "card"
      ? `relative z-10 min-h-9 rounded-full px-3 text-[13px] shadow-[0_1px_3px_rgb(14_26_43/0.2)] ${
          picked ? "bg-ink text-white" : "bg-paper/95 text-ink hover:bg-paper"
        }`
      : `min-h-12 w-full justify-center rounded-field border px-4 ${
          picked ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
        }`;

  return (
    <button
      type="button"
      aria-pressed={picked}
      disabled={!hydrated || full}
      onClick={() => toggle({ slug, title })}
      title={full ? `You can compare up to ${COMPARE_MAX} cars. Remove one first.` : undefined}
      className={`inline-flex items-center gap-1.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${look}`}
    >
      {picked ? <Check aria-hidden size={15} /> : <Plus aria-hidden size={15} />}
      {picked ? "Comparing" : "Compare"}
      <span className="sr-only">
        {title}
        {full ? ` (up to ${COMPARE_MAX} cars; remove one first)` : ""}
      </span>
    </button>
  );
}
