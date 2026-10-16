import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Temporary page body for routes built in later phases, so no link dead-ends. */
export function ComingSoon({ title, phase, children }: { title: string; phase: number; children: React.ReactNode }) {
  return (
    <section className="container-site py-16 sm:py-24">
      <p className="text-sm font-semibold text-muted">Coming in Phase {phase}</p>
      <h1 className="font-wide mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <div className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted">{children}</div>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-field border border-line px-4 py-2.5 font-semibold hover:border-ink"
      >
        <ArrowLeft aria-hidden size={18} />
        Back to home
      </Link>
    </section>
  );
}
