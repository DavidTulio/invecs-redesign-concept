import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/site/ComingSoon";
import { sampleCars } from "@/data/sample-cars";

export function generateStaticParams() {
  return sampleCars.map((car) => ({ slug: car.slug }));
}

function findCar(slug: string) {
  return sampleCars.find((car) => car.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const car = findCar((await params).slug);
  return { title: car ? `${car.year} ${car.make} ${car.model}` : "Car not found" };
}

export default async function CarPage({ params }: PageProps<"/cars/[slug]">) {
  const car = findCar((await params).slug);
  if (!car) notFound();

  return (
    <ComingSoon title={`${car.year} ${car.make} ${car.model} ${car.variant}`} phase={2}>
      <p>
        The full car page has a swipeable gallery, all specs, the complete feature list, a loan
        estimate and similar cars.
      </p>
    </ComingSoon>
  );
}
