import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { LoanCalculator } from "@/components/loan/LoanCalculator";
import { getCarBySlug } from "@/lib/data/cars";
import { carTitle } from "@/lib/types";

export const metadata: Metadata = {
  title: "Loan calculator",
  description: "Estimate your monthly car loan payment. Adjust the down payment, term and rate.",
};

const DEFAULT_PRICE = 1_000_000;

export default function LoanCalculatorPage({ searchParams }: PageProps<"/loan-calculator">) {
  return (
    <div className="container-site py-8 sm:py-12">
      <h1 className="font-wide text-3xl font-extrabold sm:text-4xl">Loan calculator</h1>
      <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-muted">
        See roughly what a car costs per month. Change the down payment, term or rate and the
        estimate updates right away.
      </p>
      <div className="mt-8">
        <Suspense fallback={<LoanCalculator initialPrice={DEFAULT_PRICE} />}>
          <CalculatorForCar searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

/** Opened from a car page (?car=…), the calculator starts with that car's price. */
async function CalculatorForCar({ searchParams }: Pick<PageProps<"/loan-calculator">, "searchParams">) {
  const params = await searchParams;
  const slug = typeof params.car === "string" ? params.car : undefined;
  const car = slug ? await getCarBySlug(slug) : null;

  // Prefer the real car price; a bare ?price= is accepted within sensible bounds.
  const urlPrice = Number(typeof params.price === "string" ? params.price : NaN);
  const price = car?.price_php ?? (urlPrice >= 50_000 && urlPrice <= 50_000_000 ? Math.round(urlPrice) : DEFAULT_PRICE);

  return (
    <>
      {car && (
        <p className="-mt-4 mb-6 flex flex-wrap items-center gap-x-2 text-sm">
          <span className="text-muted">Estimating for</span>
          <Link href={`/cars/${car.slug}`} className="inline-flex items-center gap-1 font-semibold hover:underline">
            <ChevronLeft aria-hidden size={14} />
            {carTitle(car)} {car.variant}
          </Link>
        </p>
      )}
      <LoanCalculator
        key={price}
        initialPrice={price}
        car={car && car.status !== "sold" ? { slug: car.slug, title: carTitle(car) } : undefined}
      />
    </>
  );
}
