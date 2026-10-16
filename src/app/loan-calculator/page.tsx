import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata: Metadata = { title: "Loan calculator" };

export default function LoanCalculatorPage() {
  return (
    <ComingSoon title="Loan calculator" phase={3}>
      <p>
        Enter a price, down payment and term from 12 to 60 months to see an estimated monthly
        payment. Each car page opens it with that car&apos;s price filled in.
      </p>
    </ComingSoon>
  );
}
