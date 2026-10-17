import { OFFICIAL_SITE_URL } from "@/lib/site";

/** Required on every page: this is an unofficial concept, not the dealer's site. */
export function ConceptBanner() {
  return (
    <aside aria-label="Concept notice" className="bg-ink text-[13px] leading-snug text-[#e9edf3]">
      <p className="container-site py-2 text-center">
        Unofficial redesign concept by David Tulio. Not affiliated with INVECS Autocentrum.{" "}
        <a
          href={OFFICIAL_SITE_URL}
          className="font-semibold text-white underline underline-offset-2 hover:no-underline"
          rel="noopener"
        >
          Visit the official site
        </a>
      </p>
    </aside>
  );
}
