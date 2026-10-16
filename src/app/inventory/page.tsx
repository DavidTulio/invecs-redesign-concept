import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <ComingSoon title="Inventory" phase={2}>
      <p>
        One filter panel for body type, make and linked model, price range, year, transmission and
        fuel. Filters are saved in the link, so you can share a search or use the back button.
      </p>
    </ComingSoon>
  );
}
