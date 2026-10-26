import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CarSilhouette } from "@/components/cars/CarSilhouette";
import { formatPesoShort } from "@/lib/format";
import type { BodyTypeSummary } from "@/lib/inventory";
import { BODY_TYPE_LABELS } from "@/lib/types";

/** Live counts per body type. Types with 0 cars are already filtered out. */
export function BodyTypeShortcuts({ summaries }: { summaries: BodyTypeSummary[] }) {
  return (
    <section aria-labelledby="body-types-title" className="container-site section-y">
      <h2 id="body-types-title" className="section-title">
        Shop by body type
      </h2>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {summaries.map(({ type, count, fromPrice }) => (
          <li key={type}>
            <Link
              href={`/inventory?body=${type}`}
              className="group grid grid-cols-[1fr_auto] items-end gap-x-4 gap-y-3 rounded-card border border-line p-5 transition-colors hover:border-ink"
            >
              <CarSilhouette type={type} className="col-span-2 h-10 w-auto justify-self-start text-ink-2" />
              <div>
                <p className="font-wide text-lg font-bold">{BODY_TYPE_LABELS[type]}</p>
                <p className="text-sm text-muted">From {formatPesoShort(fromPrice)}</p>
              </div>
              <p className="flex items-center gap-1.5 text-right">
                <span className="font-display text-4xl leading-none font-extrabold text-signal tabular-nums">
                  {count}
                </span>
                <span className="sr-only">{count === 1 ? "car" : "cars"} in stock</span>
                <ArrowRight
                  aria-hidden
                  size={18}
                  className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
