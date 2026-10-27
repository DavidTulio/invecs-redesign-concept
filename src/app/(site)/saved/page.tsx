import type { Metadata } from "next";
import { SavedCars } from "@/components/favourites/SavedCars";
import { getAllCars } from "@/lib/data/cars";

export const metadata: Metadata = {
  title: "Saved cars",
  description: "Cars you saved on this device, with price changes since you saved them.",
};

export default async function SavedPage() {
  // Favourites live in the visitor's browser, so the page sends the current stock
  // (without the long descriptions) and the browser picks out the saved cars.
  const cars = (await getAllCars()).map((car) => ({ ...car, description: "" }));
  return (
    <div className="container-site py-8 sm:py-12">
      <h1 className="font-wide text-3xl font-extrabold sm:text-4xl">Saved cars</h1>
      <SavedCars cars={cars} />
    </div>
  );
}
