import { z } from "zod";

// Car loan estimate using the standard amortisation formula:
//   M = P × r / (1 − (1 + r)^−n)
// P = amount financed, r = monthly rate, n = number of months.
// This is an estimate only; Philippine banks set their own rates and fees.

export const LOAN_DEFAULTS = {
  downPaymentPct: 20,
  termMonths: 48,
  annualRatePct: 10,
} as const;

export const LOAN_TERMS = [12, 24, 36, 48, 60] as const;

export const loanInputSchema = z.object({
  price: z.number().int().min(50_000, "Enter a price of at least ₱50,000").max(50_000_000, "Enter a price up to ₱50,000,000"),
  downPaymentPct: z.number().min(0).max(90),
  termMonths: z.number().int().refine((n) => (LOAN_TERMS as readonly number[]).includes(n), "Choose 12 to 60 months"),
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

export function calculateLoan({ price, downPaymentPct, termMonths, annualRatePct }: LoanInput): LoanBreakdown {
  const downPayment = Math.round((price * downPaymentPct) / 100);
  const amountFinanced = price - downPayment;
  const monthly = monthlyPayment(amountFinanced, annualRatePct, termMonths);
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
