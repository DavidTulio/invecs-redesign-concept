"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { COMPARE_MAX, compareHref } from "@/lib/compare";
import { useCompare } from "@/lib/use-compare";

/** Slim bar at the bottom of the screen once a car is picked for comparing. */
export function CompareBar() {
  const pathname = usePathname();
  const { list, remove, clear } = useCompare();
  if (list.length === 0 || pathname === "/compare") return null;

  const ready = list.length >= 2;

  return (
    <>
      {/* Keeps the footer from hiding behind the bar. */}
      <div aria-hidden className="h-20" />
      <section
        aria-label="Cars to compare"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper shadow-[0_-6px_20px_-12px_rgb(14_26_43/0.35)]"
      >
        <div className="container-site flex min-h-16 items-center gap-3 py-2.5">
          <p className="shrink-0 text-sm font-semibold tabular-nums">
            Compare <span className="text-muted">{list.length}/{COMPARE_MAX}</span>
          </p>

          <ul className="hidden min-w-0 flex-1 gap-2 overflow-hidden md:flex">
            {list.map((item) => (
              <li key={item.slug} className="flex min-w-0 items-center gap-1 rounded-full bg-soft py-1 pr-1 pl-3 text-sm">
                <span className="truncate">{item.title}</span>
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-line hover:text-ink"
                >
                  <X aria-hidden size={14} />
                  <span className="sr-only">Remove {item.title} from compare</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button type="button" onClick={clear} className="min-h-11 px-2 text-sm font-semibold text-muted hover:text-ink">
              Clear
            </button>
            {ready ? (
              <Link
                href={compareHref(list.map((item) => item.slug))}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-field bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-2"
              >
                Compare
                <ArrowRight aria-hidden size={16} />
              </Link>
            ) : (
              <p className="text-sm text-muted">Pick one more car</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
