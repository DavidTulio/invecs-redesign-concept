import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site py-16 sm:py-24">
      <p className="text-sm font-semibold text-muted">Page not found</p>
      <h1 className="font-wide mt-2 text-3xl font-extrabold sm:text-4xl">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-4 max-w-[60ch] text-[17px] text-muted">
        The car may have been sold, or the link may be wrong.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/inventory"
          className="rounded-field bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark"
        >
          Browse all cars
        </Link>
        <Link href="/" className="rounded-field border border-line px-4 py-2.5 font-semibold hover:border-ink">
          Back to home
        </Link>
      </div>
    </section>
  );
}
