import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { InquiryForm, type CarOption } from "@/components/forms/InquiryForm";
import { DemoNotice } from "@/components/site/DemoNotice";
import { getAllCars } from "@/lib/data/cars";
import { ASK_TOPICS, askMessage, BOOKING_WINDOW_DAYS, manilaDate } from "@/lib/inquiry";
import { inStock } from "@/lib/inventory";
import { createFormStamp } from "@/lib/server/form-guard";
import { carTitle } from "@/lib/types";

export const metadata: Metadata = {
  title: "Book a test drive",
  description: "Request a test drive. Choose a car, a date and time, and how you'd like to be contacted.",
};

export default function TestDrivePage({ searchParams }: PageProps<"/test-drive">) {
  return (
    <div className="container-site grid gap-8 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
      <div className="min-w-0">
        <h1 className="font-wide text-3xl font-extrabold sm:text-4xl">Book a test drive</h1>
        <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-muted">
          Pick a car, a date and a time that suit you. We&apos;ll confirm by your chosen contact method.
          Only have a question?{" "}
          <Link href="/branches#ask" className="font-semibold text-signal hover:underline">
            Ask it here
          </Link>
          , no date needed.
        </p>

        <div className="mt-6">
          <DemoNotice>Demo: this form works, but your message won&apos;t reach INVECS Autocentrum.</DemoNotice>
        </div>

        <div className="mt-8">
          <Suspense fallback={<div className="h-[40rem] rounded-card bg-soft" aria-hidden />}>
            <TestDriveForm searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      <aside aria-labelledby="next-steps-title" className="lg:pt-16">
        <h2 id="next-steps-title" className="font-wide text-lg font-bold">
          What happens next
        </h2>
        <ol className="mt-4 grid gap-4 text-[15px]">
          {[
            ["Send your request", "Choose a car, a date and time, and how to reach you."],
            ["We confirm", "The showroom replies by call, Viber, Messenger or email to confirm your slot."],
            ["Drive it", "Bring a valid driver's license. The test drive takes about 30 minutes."],
          ].map(([title, body], index) => (
            <li key={title} className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

async function TestDriveForm({ searchParams }: Pick<PageProps<"/test-drive">, "searchParams">) {
  const { car, ask, tradein } = await searchParams;
  // Rendered per request: the anti-bot time stamp and "tomorrow" must be fresh.
  await connection();
  const now = new Date();

  const cars: CarOption[] = inStock(await getAllCars())
    .map((c) => ({
      slug: c.slug,
      label: `${carTitle(c)} ${c.variant}`,
      price: c.price_php,
      reserved: c.status === "reserved",
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const requested = typeof car === "string" ? car : undefined;
  const defaultCar = cars.some((c) => c.slug === requested) ? requested : undefined;
  // Coming from "Ask for more details" on a car page: start the message for them.
  const topic = ASK_TOPICS.find((t) => t === ask);
  const carLabel = cars.find((c) => c.slug === defaultCar)?.label;
  const defaultMessage = topic && carLabel ? askMessage(topic, carLabel) : undefined;

  return (
    <InquiryForm
      cars={cars}
      defaultCar={defaultCar}
      defaultMessage={defaultMessage}
      // From "Trade in your car" on the Services page: open the trade-in section.
      defaultTradeIn={tradein === "1"}
      formStamp={createFormStamp(now.getTime())}
      minDate={manilaDate(now, 1)}
      maxDate={manilaDate(now, BOOKING_WINDOW_DAYS)}
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
    />
  );
}
