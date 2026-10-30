import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

// The worries Filipino used-car buyers actually have (papers, flood damage, hidden loans,
// stolen cars), answered as a pre-listing inspection sheet instead of generic icons.
const CHECKS = [
  { item: "Original OR/CR verified", detail: "Engine and chassis numbers match the Official Receipt and Certificate of Registration." },
  { item: "HPG clearance", detail: "PNP Highway Patrol Group check that the car isn't reported stolen." },
  { item: "No unpaid car loan", detail: "Any bank mortgage on the car is released before it's sold." },
  { item: "Flood check", detail: "Carpets, under-seat rust and the electricals are checked for water damage." },
  { item: "Accident and repaint check", detail: "Panel gaps and paint thickness show past repairs." },
  { item: "Engine and transmission", detail: "Test-driven before listing: starting, shifting, braking, no warning lights." },
  { item: "Underchassis and suspension", detail: "Checked on a lift for rust, leaks and worn parts." },
  { item: "Service history", detail: "Casa (dealer service) records are included when available." },
] as const;

export function WhyBuyHere() {
  return (
    <section aria-labelledby="why-title" className="container-site section-y">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start lg:pt-2">
          <h2 id="why-title" className="section-title">
            Checked before it&apos;s listed
          </h2>
          <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-muted">
            Buying a used car shouldn&apos;t feel like a gamble. Every car goes through the same
            8-point check before it appears here, so the papers, the history and the car itself
            are sorted before you visit.
          </p>
          <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-muted">
            Then see every feature on the car&apos;s page, and ask us anything by call, Viber,
            Messenger or email.
          </p>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
            We also handle financing, trade-ins, insurance and LTO registration, PMS and detailing.{" "}
            <Link href="/services" className="inline-flex items-center gap-1 font-semibold text-signal hover:underline">
              See all services
              <ArrowRight aria-hidden size={15} />
            </Link>
          </p>
        </div>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-card border border-line">
            <div className="flex items-baseline justify-between gap-4 border-b border-line bg-soft px-5 py-3">
              <p className="text-[12px] font-semibold tracking-[0.12em] text-ink-2 uppercase">Pre-listing inspection</p>
              <p className="text-[12px] font-semibold text-muted tabular-nums">{CHECKS.length} points</p>
            </div>
            <ul className="divide-y divide-line">
              {CHECKS.map(({ item, detail }) => (
                <li key={item} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 px-5 py-3.5">
                  <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-[#e6f4ed] text-ok">
                    <Check aria-hidden size={15} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{item}</p>
                    <p className="text-sm text-muted">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-xs text-muted">Sample checklist for this concept.</p>
        </div>
      </div>
    </section>
  );
}
