import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Wordmark } from "@/components/site/Wordmark";

export const metadata: Metadata = { title: "Sign in" };

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    // Phones: the card spans the full width so the CAPTCHA (300px minimum) fits inside its padding.
    <div className="grid min-h-[70vh] place-items-center py-12 sm:px-4">
      <div className="w-full border-y border-line bg-paper p-4 sm:max-w-sm sm:rounded-card sm:border sm:p-8">
        <Wordmark />
        <h1 className="font-wide mt-6 text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">For the dealer&apos;s staff only. There is no public sign-up.</p>
        <div className="mt-6">
          <Suspense fallback={<LoginForm siteKey={siteKey} />}>
            <LoginWithNotice searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
      <Link href="/" className="mt-6 px-4 text-sm font-semibold text-muted hover:text-ink">
        ← Back to the website
      </Link>
    </div>
  );
}

async function LoginWithNotice({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { error } = await searchParams;
  const notice = error === "not-admin" ? "That account doesn't have admin access." : undefined;
  return <LoginForm siteKey={siteKey} notice={notice} />;
}
