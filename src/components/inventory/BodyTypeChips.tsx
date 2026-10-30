"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { inventoryHref, type Filters, type Option } from "@/lib/filters";
import { BODY_TYPE_LABELS } from "@/lib/types";
import { useFilterNav } from "./FilterNav";

/**
 * Body type in one tap, above the results: usually a buyer's first choice, so it
 * isn't hidden in the filter panel. Real links (they work before scripts load);
 * with scripts, the shared filter navigation updates the page instantly.
 */
export function BodyTypeChips({ options }: { options: Option[] }) {
  const { filters, update } = useFilterNav();
  const chips: { value: Filters["body"]; label: string; count?: number }[] = [
    { value: undefined, label: "All" },
    ...options.map((option) => ({ value: option.value as Filters["body"], label: option.label, count: option.count })),
  ];
  // An old or edited link may hold a body type with no cars left: still show it as chosen, with 0.
  if (filters.body && !options.some((option) => option.value === filters.body)) {
    chips.push({ value: filters.body, label: BODY_TYPE_LABELS[filters.body], count: 0 });
  }

  return (
    <nav aria-label="Body type">
      {/* Phones: wraps to two short rows, like the home page's showroom tabs; no sideways scrolling. */}
      <ul className="flex flex-wrap gap-2">
        {chips.map(({ value, label, count }) => {
          const active = filters.body === value;
          const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
            // Let ctrl/cmd-click open a new tab as usual.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            event.preventDefault();
            update({ body: value });
          };
          return (
            <li key={label}>
              <Link
                href={inventoryHref({ ...filters, body: value })}
                scroll={false}
                onClick={onClick}
                aria-current={active ? "true" : undefined}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                  active ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink"
                }`}
              >
                {label}
                {count !== undefined && <span className="font-normal tabular-nums opacity-70">{count}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
