import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  Cog,
  FileText,
  HandCoins,
  Repeat,
  ScanLine,
  ShieldCheck,
  SprayCan,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Pre-owned and brand-new cars, financing, trade-ins, insurance, LTO registration, OBD scanning, PMS, repairs and detailing.",
};

type Service = { icon: LucideIcon; name: string; detail: string; link?: { href: string; label: string } };

// From INVECS Autocentrum's own services list. No prices or promises: INVECS quotes those.
const GROUPS: { title: string; services: Service[] }[] = [
  {
    title: "Buying a car",
    services: [
      { icon: Car, name: "Pre-owned and brand-new cars", detail: "Inspected used cars, and brand-new units on request.", link: { href: "/inventory", label: "See cars" } },
      { icon: HandCoins, name: "Financing", detail: "Pay monthly through a bank or in-house financing.", link: { href: "/loan-calculator", label: "Estimate payments" } },
      { icon: Repeat, name: "Trade-in", detail: "Use your current car as part of the payment.", link: { href: "/test-drive?tradein=1", label: "Trade in your car" } },
    ],
  },
  {
    title: "Paperwork",
    services: [
      { icon: ShieldCheck, name: "Insurance", detail: "Help arranging insurance for your car." },
      { icon: FileText, name: "LTO registration", detail: "Registration and renewal with the LTO." },
    ],
  },
  {
    title: "Car care",
    services: [
      { icon: ScanLine, name: "OBD scanning", detail: "A computer check that reads your car's warning codes." },
      { icon: Wrench, name: "PMS, change oil and tune-up", detail: "Regular maintenance to keep your car running well." },
      { icon: Cog, name: "Overhauling and under-chassis repair", detail: "Engine overhauls, suspension and other repairs underneath." },
      { icon: SprayCan, name: "Auto detailing and painting", detail: "Cleaning, polishing and paint work, inside and out." },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="container-site py-8 sm:py-12">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-sm font-semibold text-ink-2">
        <BadgeCheck aria-hidden size={16} className="text-ok" />
        Trusted since 2002
      </p>
      <h1 className="font-wide mt-3 text-3xl font-extrabold sm:text-4xl">Services</h1>
      <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-muted">
        Besides selling cars, INVECS Autocentrum helps with financing, paperwork and keeping your car in good
        shape.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-6">
        {GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={`group-${group.title}`} className="min-w-0">
            <h2 id={`group-${group.title}`} className="text-[12px] font-semibold tracking-[0.12em] text-ink-2 uppercase">
              {group.title}
            </h2>
            <ul className="mt-3 divide-y divide-line rounded-card border border-line">
              {group.services.map(({ icon: Icon, name, detail, link }) => (
                <li key={name} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 p-4">
                  <span className="grid size-10 place-items-center rounded-full bg-soft text-ink-2">
                    <Icon aria-hidden size={20} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{name}</h3>
                    <p className="mt-0.5 text-sm text-muted">{detail}</p>
                    {link && (
                      <Link
                        href={link.href}
                        className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-signal hover:underline"
                      >
                        {link.label}
                        <ArrowRight aria-hidden size={15} />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-card bg-soft p-5 sm:p-6">
        <p className="max-w-[55ch] text-ink-2">
          Prices and availability depend on the car and the service. Ask us and we&apos;ll tell you.
        </p>
        <Link
          href="/branches"
          className="inline-flex min-h-12 items-center gap-2 rounded-field bg-ink px-5 font-semibold text-white hover:bg-ink-2"
        >
          Ask about a service
          <ArrowRight aria-hidden size={18} />
        </Link>
      </div>
    </div>
  );
}
