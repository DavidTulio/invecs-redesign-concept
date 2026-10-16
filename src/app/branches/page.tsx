import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata: Metadata = { title: "Branches & contact" };

export default function BranchesPage() {
  return (
    <ComingSoon title="Branches & contact" phase={3}>
      <p>Branch addresses, opening hours, map links, and call, Viber and Messenger options.</p>
    </ComingSoon>
  );
}
