import Link from "next/link";

/** Text-only wordmark. We deliberately don't copy the dealer's logo image. */
export function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link
      href="/"
      className={`inline-flex flex-col leading-none ${tone === "light" ? "text-white" : "text-ink"}`}
      aria-label="INVECS Autocentrum home"
    >
      <span className="font-wider text-[22px] font-extrabold tracking-[0.02em]">INVECS</span>
      <span
        className={`mt-1 font-display text-[9.5px] font-medium tracking-[0.34em] ${
          tone === "light" ? "text-[#b9c2d0]" : "text-muted"
        }`}
      >
        AUTOCENTRUM
      </span>
    </Link>
  );
}
