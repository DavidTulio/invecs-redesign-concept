import type { Metadata } from "next";
import { PRIVACY_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "What this site collects, why, how long it is kept, and how to ask for your details to be deleted.",
};

// Every point matches what the code does: see src/actions/inquiry.ts and supabase/migrations/0002–0003.
// If INVECS adopts the site, rewrite this with INVECS as the one handling the data.
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect",
    body: (
      <>
        Only what you type into the test-drive or question form: your name, your phone number and/or email, how
        you&apos;d like to be contacted, and your message. A test-drive request also keeps the car, date and time you
        picked, and any trade-in details you add.
      </>
    ),
  },
  {
    title: "Why",
    body: <>Only to answer your request. We don&apos;t sell, share or use it for advertising.</>,
  },
  {
    title: "How long we keep it",
    body: <>Your request is deleted automatically after 30 days.</>,
  },
  {
    title: "Spam protection",
    body: (
      <>
        To stop spam, we briefly keep a scrambled code made from your internet address. It can&apos;t be turned back
        into the address, and it is deleted after one day. The form also uses Cloudflare Turnstile, which checks that
        you&apos;re a person and not a bot.
      </>
    ),
  },
  {
    title: "Cookies and saved cars",
    body: (
      <>
        We don&apos;t use tracking or advertising cookies. Cars you save or compare are stored only on your own phone
        or computer, and you can clear them anytime. Staff who sign in to the admin area get a login cookie, which
        keeps them signed in.
      </>
    ),
  },
  {
    title: "Where your data is stored",
    body: <>On secure servers run by Supabase and Vercel in Singapore.</>,
  },
  {
    title: "Your rights",
    body: (
      <>
        Under the Data Privacy Act of 2012 (RA 10173), you can ask to see, correct or delete your details. Email{" "}
        <a href={`mailto:${PRIVACY_EMAIL}`} className="font-semibold whitespace-nowrap text-ink underline underline-offset-2">
          {PRIVACY_EMAIL}
        </a>{" "}
        and we&apos;ll reply within a few days.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-site py-8 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="font-wide text-3xl font-extrabold sm:text-4xl">Privacy notice</h1>
        <p className="mt-2 text-sm text-muted">Last updated: November 1, 2026</p>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">
          This website is a design concept by David Tulio, shown with permission from INVECS Autocentrum. It is not
          INVECS&apos;s official website, and the forms on it don&apos;t send anything to INVECS.
        </p>

        <div className="mt-8 grid gap-6">
          {SECTIONS.map(({ title, body }) => (
            <section key={title} className="border-t border-line pt-5">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 leading-relaxed text-ink-2">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
