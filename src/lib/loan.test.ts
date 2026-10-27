import { describe, expect, it } from "vitest";
import { addOnMonthlyPayment, addOnRateForTerm, calculateLoan, estimateMonthly, loanInputSchema, monthlyPayment } from "./loan";

/** Simulates the loan month by month: if the payment is right, the balance ends at 0. */
function balanceAfter(principal: number, annualRatePct: number, months: number, payment: number) {
  let balance = principal;
  for (let m = 0; m < months; m++) balance = balance * (1 + annualRatePct / 1200) - payment;
  return balance;
}

describe("monthlyPayment", () => {
  // Cross-checked with the present-value method: 880000 / Σ(1+r)^-k for k = 1..48.
  it("matches a known example: ₱880,000 at 10% for 48 months", () => {
    expect(monthlyPayment(880_000, 10, 48)).toBeCloseTo(22_319.07, 1);
  });

  it("pays the loan off exactly over the term", () => {
    for (const [principal, rate, months] of [
      [500_000, 8, 12],
      [1_200_000, 12.5, 36],
      [2_000_000, 6, 60],
    ]) {
      const payment = monthlyPayment(principal, rate, months);
      expect(balanceAfter(principal, rate, months, payment)).toBeCloseTo(0, 4);
    }
  });

  it("splits the amount evenly when the rate is 0%", () => {
    expect(monthlyPayment(600_000, 0, 24)).toBe(25_000);
  });

  it("returns 0 when nothing is financed", () => {
    expect(monthlyPayment(0, 10, 48)).toBe(0);
  });

  it("is higher for shorter terms", () => {
    expect(monthlyPayment(800_000, 10, 24)).toBeGreaterThan(monthlyPayment(800_000, 10, 60));
  });
});

describe("calculateLoan", () => {
  it("works out the down payment, amount financed and totals", () => {
    const loan = calculateLoan({ price: 1_100_000, downPaymentPct: 20, termMonths: 48, rateType: "diminishing", annualRatePct: 10 });
    expect(loan.downPayment).toBe(220_000);
    expect(loan.amountFinanced).toBe(880_000);
    expect(loan.totalInterest).toBeCloseTo(loan.monthly * 48 - 880_000, 6);
    expect(loan.totalCost).toBeCloseTo(220_000 + loan.monthly * 48, 6);
  });

  it("has no monthly payment or interest when paid in full", () => {
    const loan = calculateLoan({ price: 500_000, downPaymentPct: 100, termMonths: 12, rateType: "diminishing", annualRatePct: 10 });
    expect(loan.monthly).toBe(0);
    expect(loan.totalInterest).toBe(0);
  });
});

describe("add-on rate", () => {
  // The worked example from the case study: ₱800,000 at 12% add-on for 48 months.
  it("charges interest on the full loan for the whole term", () => {
    expect(addOnMonthlyPayment(800_000, 12, 48)).toBeCloseTo(24_666.67, 2);
    const loan = calculateLoan({ price: 1_000_000, downPaymentPct: 20, termMonths: 48, rateType: "addon", annualRatePct: 12 });
    expect(loan.totalInterest).toBeCloseTo(384_000, 6);
    expect(loan.totalCost).toBeCloseTo(200_000 + 1_184_000, 6);
  });

  it("costs more than the same rate on a diminishing balance", () => {
    expect(monthlyPayment(800_000, 12, 48)).toBeCloseTo(21_067.07, 1);
    expect(addOnMonthlyPayment(800_000, 12, 48)).toBeGreaterThan(monthlyPayment(800_000, 12, 48));
  });

  it("shows the yearly rate as the total for the term, like bank rate sheets", () => {
    expect(addOnRateForTerm(9, 48)).toBe(36);
    expect(addOnRateForTerm(9, 12)).toBe(9);
  });

  it("splits the amount evenly at 0% and returns 0 when nothing is financed", () => {
    expect(addOnMonthlyPayment(600_000, 0, 24)).toBe(25_000);
    expect(addOnMonthlyPayment(0, 9, 48)).toBe(0);
  });
});

describe("estimateMonthly", () => {
  it("uses the default add-on rate and rounds to the nearest ₱100", () => {
    // ₱880,000 financed × (1 + 9% × 4 years) ÷ 48 = ₱24,933
    expect(estimateMonthly(1_100_000)).toBe(24_900);
    expect(estimateMonthly(1_100_000) % 100).toBe(0);
  });
});

describe("loanInputSchema", () => {
  const valid = { price: 900_000, downPaymentPct: 20, termMonths: 36, rateType: "addon", annualRatePct: 9 };

  it("accepts sensible input", () => {
    expect(loanInputSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["a tiny price", { price: 1_000 }],
    ["a negative down payment", { downPaymentPct: -5 }],
    ["a down payment over 90%", { downPaymentPct: 95 }],
    ["a term that banks don't offer", { termMonths: 18 }],
    ["an unrealistic rate", { annualRatePct: 80 }],
    ["an unknown rate type", { rateType: "flat" }],
  ])("rejects %s", (_, patch) => {
    expect(loanInputSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});
