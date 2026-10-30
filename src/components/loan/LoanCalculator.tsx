"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CalendarCheck, MessageCircleQuestion } from "lucide-react";
import { formatPeso } from "@/lib/format";
import {
  addOnRateForTerm,
  calculateLoan,
  LOAN_DEFAULTS,
  LOAN_TERMS,
  loanInputSchema,
  RATE_TYPE_LABELS,
  RATE_TYPES,
  type RateType,
} from "@/lib/loan";

const RATE_TYPE_HINTS: Record<RateType, string> = {
  addon: "Most PH banks",
  diminishing: "Interest on what you still owe",
};

type CarContext = { slug: string; title: string };

export function LoanCalculator({ initialPrice, car }: { initialPrice: number; car?: CarContext }) {
  const id = useId();
  const [priceText, setPriceText] = useState(String(initialPrice));
  const [downPaymentPct, setDownPaymentPct] = useState<number>(LOAN_DEFAULTS.downPaymentPct);
  const [termMonths, setTermMonths] = useState<number>(LOAN_DEFAULTS.termMonths);
  const [rateType, setRateType] = useState<RateType>(LOAN_DEFAULTS.rateType);
  const [rateText, setRateText] = useState(String(LOAN_DEFAULTS.annualRatePct));

  const input = {
    price: Number(priceText),
    downPaymentPct,
    termMonths,
    rateType,
    annualRatePct: Number(rateText),
  };
  const parsed = loanInputSchema.safeParse(input);
  const issues = parsed.success ? {} : Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message]));
  const loan = parsed.success ? calculateLoan(parsed.data) : null;

  const priceError = priceText === "" ? "Enter the car's price" : issues.price;
  const rateError = rateText === "" || issues.annualRatePct ? "Enter a rate from 0% to 40%" : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
      <form className="grid content-start gap-7" onSubmit={(e) => e.preventDefault()} aria-label="Loan details">
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-price`} className="text-sm font-semibold">
            Car price
          </label>
          <div className="relative">
            <span aria-hidden className="absolute top-1/2 left-3 -translate-y-1/2 font-semibold text-muted">
              ₱
            </span>
            <input
              id={`${id}-price`}
              inputMode="numeric"
              autoComplete="off"
              value={priceText === "" ? "" : Number(priceText).toLocaleString("en-PH")}
              onChange={(e) => setPriceText(e.target.value.replace(/\D/g, "").slice(0, 9))}
              aria-invalid={priceError ? true : undefined}
              aria-describedby={priceError ? `${id}-price-error` : undefined}
              className="w-full rounded-field border border-line py-3 pr-3 pl-8 font-display text-2xl font-extrabold tabular-nums focus:border-ink aria-[invalid=true]:border-signal"
            />
          </div>
          {priceError && (
            <p id={`${id}-price-error`} className="text-sm font-medium text-signal">
              {priceError}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`${id}-down`} className="text-sm font-semibold">
              Down payment
            </label>
            <p className="text-sm tabular-nums">
              <span className="font-semibold">{downPaymentPct}%</span>
              {loan && <span className="text-muted"> · {formatPeso(loan.downPayment)}</span>}
            </p>
          </div>
          <input
            id={`${id}-down`}
            type="range"
            min={0}
            max={90}
            step={5}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            aria-valuetext={`${downPaymentPct} percent`}
            className="w-full accent-signal"
          />
          <p className="text-xs text-muted">Most banks ask for at least 20% down on used cars.</p>
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-semibold">Loan term</legend>
          <div className="grid grid-cols-5 gap-1.5">
            {LOAN_TERMS.map((months) => (
              <label
                key={months}
                className="cursor-pointer rounded-field border border-line py-2.5 text-center text-sm font-semibold tabular-nums has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal"
              >
                <input
                  type="radio"
                  name="term"
                  value={months}
                  checked={termMonths === months}
                  onChange={() => setTermMonths(months)}
                  className="sr-only"
                />
                {months}
                <span className="block text-[11px] font-normal opacity-80">months</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-semibold">How does the bank quote the rate?</legend>
          <div className="grid grid-cols-2 gap-1.5">
            {RATE_TYPES.map((type) => (
              <label
                key={type}
                className="cursor-pointer rounded-field border border-line px-3 py-2.5 text-center text-sm font-semibold has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal"
              >
                <input
                  type="radio"
                  name="rate-type"
                  value={type}
                  checked={rateType === type}
                  onChange={() => setRateType(type)}
                  className="sr-only"
                />
                {RATE_TYPE_LABELS[type]}
                <span className="block text-[11px] font-normal opacity-80">{RATE_TYPE_HINTS[type]}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted">
            Not sure? Ask the bank whether its rate is add-on or diminishing. The same number costs more
            as add-on.
          </p>
        </fieldset>

        <div className="grid gap-1.5">
          <label htmlFor={`${id}-rate`} className="text-sm font-semibold">
            {RATE_TYPE_LABELS[rateType]} rate per year
          </label>
          <div className="relative w-40">
            <input
              id={`${id}-rate`}
              inputMode="decimal"
              value={rateText}
              onChange={(e) => setRateText(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))}
              aria-invalid={rateError ? true : undefined}
              aria-describedby={`${id}-rate-hint`}
              className="w-full rounded-field border border-line py-2.5 pr-8 pl-3 font-semibold tabular-nums focus:border-ink aria-[invalid=true]:border-signal"
            />
            <span aria-hidden className="absolute top-1/2 right-3 -translate-y-1/2 text-muted">
              %
            </span>
          </div>
          <p id={`${id}-rate-hint`} className={`text-xs ${rateError ? "font-medium text-signal" : "text-muted"}`}>
            {rateError ??
              (rateType === "addon"
                ? `Same as ${formatRate(addOnRateForTerm(Number(rateText), termMonths))}% for ${termMonths} months, the way bank rate sheets often list it. A sample rate; your bank quotes its own.`
                : "A sample rate. Your bank will quote its actual rate.")}
          </p>
        </div>
      </form>

      <section aria-labelledby={`${id}-result`} className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card bg-ink p-6 text-white">
          <h2 id={`${id}-result`} className="text-sm font-semibold text-[#b9c2d0]">
            Estimated monthly payment
          </h2>
          <p aria-live="polite" className="font-wider mt-2 text-[44px] leading-none font-extrabold tabular-nums">
            {loan ? formatPeso(Math.round(loan.monthly)) : "–"}
          </p>
          <p className="mt-2 text-sm text-[#b9c2d0] tabular-nums">
            for {termMonths} months{loan && ` · ${formatRate(Number(rateText))}% ${rateType === "addon" ? "add-on" : "diminishing"} a year`}
          </p>

          {loan && (
            <>
              <CostBar down={loan.downPayment} financed={loan.amountFinanced} interest={loan.totalInterest} />
              <dl className="mt-5 grid gap-2 text-sm tabular-nums">
                <Row label="Down payment" value={formatPeso(loan.downPayment)} swatch="bg-white" />
                <Row label="Amount financed" value={formatPeso(loan.amountFinanced)} swatch="bg-[#8a97ab]" />
                <Row label="Total interest" value={formatPeso(Math.round(loan.totalInterest))} swatch="bg-signal" />
                <div className="mt-1 flex justify-between border-t border-white/15 pt-3 font-semibold">
                  <dt>Total cost of the car</dt>
                  <dd>{formatPeso(Math.round(loan.totalCost))}</dd>
                </div>
              </dl>
            </>
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          Estimate only, not a loan offer. Banks set their own rates, fees, insurance and required
          down payment, so your actual payment may differ.
        </p>

        {/* With a car: book it. Without one: a financing question, which needs no test-drive date. */}
        <Link
          href={car ? `/test-drive?car=${car.slug}` : "/branches?topic=financing#ask"}
          className="mt-4 flex items-center justify-center gap-2 rounded-field bg-signal px-4 py-3 font-semibold text-white hover:bg-signal-dark"
        >
          {car ? <CalendarCheck aria-hidden size={18} /> : <MessageCircleQuestion aria-hidden size={18} />}
          {car ? "Book a test drive of this car" : "Ask us about financing"}
        </Link>
      </section>
    </div>
  );
}

/** 36 → "36", 8.5 → "8.5", 2.6666 → "2.67" */
function formatRate(value: number) {
  return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : "–";
}

/** Where the money goes: down payment, the loan itself, and interest. */
function CostBar({ down, financed, interest }: { down: number; financed: number; interest: number }) {
  const total = down + financed + interest;
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden>
      <div className="bg-white" style={{ width: pct(down) }} />
      <div className="bg-[#8a97ab]" style={{ width: pct(financed) }} />
      <div className="bg-signal" style={{ width: pct(interest) }} />
    </div>
  );
}

function Row({ label, value, swatch }: { label: string; value: string; swatch: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="flex items-center gap-2 text-[#d4dae3]">
        <span className={`size-2.5 rounded-full ${swatch}`} aria-hidden />
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
