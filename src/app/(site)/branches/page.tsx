import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Clock, ExternalLink, MapPin } from "lucide-react";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { ContactButtons } from "@/components/site/ContactButtons";
import { DemoNotice } from "@/components/site/DemoNotice";
import { getBranches } from "@/lib/data/branches";
import { QUESTION_TOPICS } from "@/lib/inquiry";
import { createFormStamp } from "@/lib/server/form-guard";

export const metadata: Metadata = {
  title: "Branches & contact",
  description: "Showroom address, opening hours, map, and ways to reach a person: call, Viber, Messenger, email or a question form.",
};

export default async function BranchesPage({ searchParams }: PageProps<"/branches">) {
  const branches = await getBranches();

  return (
    <div className="container-site py-8 sm:py-12">
      <h1 className="font-wide text-3xl font-extrabold sm:text-4xl">Branches & contact</h1>
      <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-muted">
        Visit the showroom, or reach a real person the way that suits you.
      </p>

      <div className="mt-6 max-w-3xl">
        <DemoNotice>Demo: the contact buttons and the question form below don&apos;t reach INVECS Autocentrum.</DemoNotice>
      </div>

      <ul className="mt-8 grid gap-6 lg:grid-cols-2">
        {branches.map((branch) => (
          <li key={branch.id} className="grid content-start gap-5 rounded-card border border-line p-6">
            <h2 className="font-wide text-xl font-bold">{branch.name}</h2>

            <dl className="grid gap-4 text-[15px]">
              <div className="grid grid-cols-[1.5rem_1fr] gap-2">
                <dt>
                  <MapPin aria-hidden size={20} className="text-signal" />
                  <span className="sr-only">Address</span>
                </dt>
                <dd>
                  {branch.address}
                  {branch.map_url && (
                    <a
                      href={branch.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 font-semibold text-signal hover:underline"
                    >
                      Open in Google Maps
                      <ExternalLink aria-hidden size={14} />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-[1.5rem_1fr] gap-2">
                <dt>
                  <Clock aria-hidden size={20} className="text-signal" />
                  <span className="sr-only">Opening hours</span>
                </dt>
                <dd>{branch.hours}</dd>
              </div>
            </dl>

            <ContactButtons branch={branch} />
          </li>
        ))}

        <li className="grid content-start gap-3 self-start rounded-card bg-soft p-6">
          <h2 className="font-wide text-xl font-bold">Prefer to book online?</h2>
          <p className="text-ink-2">
            Send a test-drive request with your preferred date and time. We&apos;ll confirm by call, Viber,
            Messenger or email.
          </p>
          <Link
            href="/test-drive"
            className="justify-self-start rounded-field bg-ink px-4 py-3 font-semibold text-white hover:bg-ink-2"
          >
            Book a test drive
          </Link>
        </li>
      </ul>

      <section id="ask" aria-labelledby="ask-title" className="mt-12 max-w-2xl scroll-mt-24">
        <h2 id="ask-title" className="font-wide text-2xl font-bold">
          Send us a question
        </h2>
        <p className="mt-2 text-muted">About a car, a service or financing. We&apos;ll reply by your chosen contact method.</p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-[32rem] rounded-card bg-soft" aria-hidden />}>
            <QuestionForm searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

async function QuestionForm({ searchParams }: Pick<PageProps<"/branches">, "searchParams">) {
  const { topic } = await searchParams;
  // Rendered per request: the anti-bot time stamp must be fresh.
  await connection();
  const now = new Date();

  return (
    <InquiryForm
      kind="question"
      // From "Ask about a service" on the Services page: that topic is already chosen.
      defaultTopic={QUESTION_TOPICS.find((t) => t === topic)}
      formStamp={createFormStamp(now.getTime())}
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
    />
  );
}
