import { formatPeso } from "@/lib/format";
import { estimateMonthly } from "@/lib/loan";

/**
 * The perforated "tear line" of a dealer's paper hang tag: a dashed line with
 * half-circle notches cut into both card edges. The parent must clip overflow;
 * the notches take the colour behind the card from --tag-bg (white by default).
 */
export function TearLine({ className = "" }: { className?: string }) {
  const notch =
    "absolute -top-[9px] size-[18px] rounded-full border border-line bg-[var(--tag-bg,var(--color-paper))]";
  return (
    <div aria-hidden className={`relative border-t border-dashed border-line ${className}`}>
      <span className={`${notch} -left-[9px]`} />
      <span className={`${notch} -right-[9px]`} />
    </div>
  );
}

/** The tag's price section: cash price on the left, monthly estimate on the right. */
export function PriceTag({
  price,
  size = "card",
  showMonthly = true,
}: {
  price: number;
  size?: "card" | "large";
  showMonthly?: boolean;
}) {
  const large = size === "large";
  const label = `block font-semibold tracking-[0.14em] text-muted uppercase ${large ? "text-[11px]" : "text-[10.5px]"}`;
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <p className="min-w-0">
        <span className={label}>Price</span>
        <span className={`font-display leading-tight font-extrabold tabular-nums ${large ? "text-[32px]" : "text-[21px]"}`}>
          {formatPeso(price)}
        </span>
      </p>
      {showMonthly && (
        <p className="text-right">
          <span className={label}>Monthly</span>
          <span className={`font-semibold text-signal tabular-nums ${large ? "text-[19px]" : "text-[15px]"}`}>
            ≈ {formatPeso(estimateMonthly(price))}
          </span>
        </p>
      )}
    </div>
  );
}
