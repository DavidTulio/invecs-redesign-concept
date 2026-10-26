import Image from "next/image";
import heroLot from "@/assets/hero-lot.jpg";
import { BodyTypeShowroom } from "@/components/home/BodyTypeShowroom";
import { HeroSearch } from "@/components/home/HeroSearch";
import { LatestArrivals } from "@/components/home/LatestArrivals";
import { WhyBuyHere } from "@/components/home/WhyBuyHere";
import { getAllCars } from "@/lib/data/cars";
import { bodyTypeSummaries, inStock } from "@/lib/inventory";

export default async function HomePage() {
  const available = inStock(await getAllCars()); // already newest first
  const latest = available.slice(0, 6);
  // Send the search form only the four fields it needs, not every description and photo.
  const searchCars = available.map(({ body_type, make, model, price_php }) => ({
    body_type,
    make,
    model,
    price_php,
  }));

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="container-site grid items-center gap-6 pt-4 pb-4 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:pt-12"
      >
        {/* Phones: photo first as a short strip; desktop: photo on the right. */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-soft lg:order-last lg:aspect-[4/3.4]">
          <Image
            src={heroLot}
            alt="Rows of used SUVs and sedans for sale on an outdoor dealer lot"
            fill
            preload
            placeholder="blur"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted tabular-nums">
            {available.length} cars in stock · SUVs, pickups and sedans
          </p>
          <h1
            id="hero-title"
            className="font-wide mt-3 max-w-[18ch] text-[clamp(2.1rem,5vw,3.3rem)] leading-[1.02] font-extrabold tracking-[-0.01em]"
          >
            Premium cars, <span className="text-signal">clear prices</span>, easy monthly terms.
          </h1>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-muted">
            Inspected used and nearly-new cars. See the full price and a monthly estimate on every
            car, then book a test drive online.
          </p>
          <div className="mt-7">
            <HeroSearch cars={searchCars} />
          </div>
        </div>
      </section>

      <BodyTypeShowroom summaries={bodyTypeSummaries(available)} />
      <LatestArrivals cars={latest} total={available.length} />
      <WhyBuyHere />
    </>
  );
}
