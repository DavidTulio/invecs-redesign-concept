// Monthly payment estimate for a car loan.
// Uses the standard amortisation formula: M = P × r / (1 − (1 + r)^−n)
// The defaults below are sample values for the "from ₱X/mo" labels.
// Phase 3 adds the full calculator and unit tests.

export const LOAN_DEFAULTS = {
  downPaymentPct: 20,
  termMonths: 48,
  annualRatePct: 10,
} as const;

type LoanInput = {
  price: number;
  downPaymentPct?: number;
  termMonths?: number;
  annualRatePct?: number;
};

export function monthlyPayment({
  price,
  downPaymentPct = LOAN_DEFAULTS.downPaymentPct,
  termMonths = LOAN_DEFAULTS.termMonths,
  annualRatePct = LOAN_DEFAULTS.annualRatePct,
}: LoanInput) {
  const principal = price * (1 - downPaymentPct / 100);
  if (principal <= 0 || termMonths <= 0) return 0;

  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / termMonths;

  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

/** Rounded to the nearest ₱100 so it reads as an estimate, not a quote. */
export function estimateMonthly(price: number) {
  return Math.round(monthlyPayment({ price }) / 100) * 100;
}
