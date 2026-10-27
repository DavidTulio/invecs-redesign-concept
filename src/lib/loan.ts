import { z } from "@/lib/zod";

// Car loan estimates, two ways a rate can be quoted:
//
// Add-on (most Philippine banks and dealers): interest on the FULL loan for the
// whole term. Interest = P × yearly rate × years; monthly = (P + interest) ÷ n.
// Bank rate sheets often list the total for the term ("36% for 48 months").
//
// Diminishing balance (standard amortisation): interest only on what is still owed.
//   M = P × r / (1 − (1 + r)^−n), r = monthly rate, n = number of months.
//
// The same "12%" costs more as add-on: 12% add-on ≈ 21% diminishing.
// This is an estimate only; banks set their own rates and fees.

export const RATE_TYPES = ["addon", "diminishing"] as const;
export type RateType = (typeof RATE_TYPES)[number];

export const RATE_TYPE_LABELS: Record<RateType, string> = {
  addon: "Add-on",
  diminishing: "Diminishing balance",
};

// Sample add-on rate in line with published PH used-car rates (e.g. BPI's 44.32%
// add-on for 60 months ≈ 8.9% a year, via expressway.ph, Oct 2026).
export const LOAN_DEFAULTS = {
  downPaymentPct: 20,
  termMonths: 48,
  rateType: "addon",
  annualRatePct: 9,
} as const satisfies { rateType: RateType } & Record<string, unknown>;

export const LOAN_TERMS = [12, 24, 36, 48, 60] as const;

export const loanInputSchema = z.object({
  price: z.number().int().min(50_000, "Enter a price of at least ₱50,000").max(50_000_000, "Enter a price up to ₱50,000,000"),
  downPaymentPct: z.number().min(0).max(90),
  termMonths: z.number().int().refine((n) => (LOAN_TERMS as readonly number[]).includes(n), "Choose 12 to 60 months"),
  rateType: z.enum(RATE_TYPES),
  annualRatePct: z.number().min(0).max(40),
});

export type LoanInput = z.infer<typeof loanInputSchema>;

export type LoanBreakdown = {
  downPayment: number;
  amountFinanced: number;
  monthly: number;
  totalInterest: number;
  /** Down payment plus every monthly payment. */
  totalCost: number;
};

export function monthlyPayment(principal: number, annualRatePct: number, termMonths: number) {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

/** Add-on: interest on the full loan for the whole term, split evenly over the months. */
export function addOnMonthlyPayment(principal: number, annualRatePct: number, termMonths: number) {
  if (principal <= 0 || termMonths <= 0) return 0;
  const interest = principal * (annualRatePct / 100) * (termMonths / 12);
  return (principal + interest) / termMonths;
}

/** A yearly add-on rate as the total for the term, the way bank rate sheets list it: 9% × 4 years = 36%. */
export function addOnRateForTerm(annualRatePct: number, termMonths: number) {
  return (annualRatePct * termMonths) / 12;
}

export function calculateLoan({ price, downPaymentPct, termMonths, rateType, annualRatePct }: LoanInput): LoanBreakdown {
  const downPayment = Math.round((price * downPaymentPct) / 100);
  const amountFinanced = price - downPayment;
  const monthly =
    rateType === "addon"
      ? addOnMonthlyPayment(amountFinanced, annualRatePct, termMonths)
      : monthlyPayment(amountFinanced, annualRatePct, termMonths);
  const totalPayments = monthly * termMonths;
  return {
    downPayment,
    amountFinanced,
    monthly,
    totalInterest: Math.max(0, totalPayments - amountFinanced),
    totalCost: downPayment + totalPayments,
  };
}

/** Default-terms estimate rounded to the nearest ₱100, for "≈ ₱X/mo" labels. */
export function estimateMonthly(price: number) {
  const { monthly } = calculateLoan({ price, ...LOAN_DEFAULTS });
  return Math.round(monthly / 100) * 100;
}
