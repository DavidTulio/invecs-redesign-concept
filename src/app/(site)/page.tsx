import { BodyTypeShortcuts } from "@/components/home/BodyTypeShortcuts";
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
      <section aria-labelledby="hero-title" className="container-site pt-10 pb-4 sm:pt-16">
        <p className="text-sm font-semibold text-muted tabular-nums">
          {available.length} cars in stock · SUVs, pickups and sedans
        </p>
        <h1
          id="hero-title"
          className="font-wide mt-3 max-w-[18ch] text-[clamp(2.1rem,6vw,3.6rem)] leading-[1.02] font-extrabold tracking-[-0.01em]"
        >
          Premium cars, <span className="text-signal">clear prices</span>, easy monthly terms.
        </h1>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-muted">
          Inspected used and nearly-new cars. See the full price and a monthly estimate on every
          car, then book a test drive online.
        </p>
        <div className="mt-8">
          <HeroSearch cars={searchCars} />
        </div>
      </section>

      <BodyTypeShortcuts summaries={bodyTypeSummaries(available)} />
      <LatestArrivals cars={latest} total={available.length} />
      <WhyBuyHere />
    </>
  );
}
