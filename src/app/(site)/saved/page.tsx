import type { Metadata } from "next";
import { SavedCars } from "@/components/favourites/SavedCars";

export const metadata: Metadata = {
  title: "Saved cars",
  description: "Cars you saved on this device, with price changes since you saved them.",
};

export default function SavedPage() {
  // Favourites live in the visitor's browser, which asks the server for just those cars.
  return (
    <div className="container-site py-8 sm:py-12">
      <h1 className="font-wide text-3xl font-extrabold sm:text-4xl">Saved cars</h1>
      <SavedCars />
    </div>
  );
}
