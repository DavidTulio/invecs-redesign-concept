import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { BRANCHES_TAG, getBranches } from "@/lib/data/branches";
import { NAV_LINKS, OFFICIAL_SITE_URL, TEST_DRIVE_LINK } from "@/lib/site";
import { Wordmark } from "./Wordmark";

const heading = "mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase";

/**
 * Footer led by "Visit a branch": where to go is the last thing a car buyer needs.
 * Cached like the branch data, so the year and branches refresh together.
 */
export async function SiteFooter() {
  "use cache";
  cacheLife("days");
  cacheTag(BRANCHES_TAG);

  const branches = await getBranches();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-[#c9d1dd]">
      <section aria-labelledby="footer-branches" className="border-b border-white/10">
        <div className="container-site grid gap-6 py-10 sm:py-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,2fr)] lg:gap-12">
          <div>
            <h2 id="footer-branches" className="section-title text-white">
              Visit a branch
            </h2>
            <Link
              href="/branches"
              className="mt-2 inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-white hover:underline"
            >
              Maps and contact options
              <ArrowRight aria-hidden size={16} />
            </Link>
          </div>

          <div>
            <ul className="grid gap-6">
              {branches.map((branch) => (
                <li key={branch.id} className="border-t border-white/15 pt-4">
                  <h3 className="font-semibold text-white">{branch.name}</h3>
                  <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-3">
                    {[
                      { icon: MapPin, label: "Address", value: branch.address },
                      { icon: Clock, label: "Opening hours", value: branch.hours },
                      // Plain text on purpose: this concept never dials the real dealer.
                      { icon: Phone, label: "Phone", value: branch.phone },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label}>
                        <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-[#9aa5b5] uppercase">
                          <Icon aria-hidden size={14} />
                          {label}
                        </dt>
                        <dd className="mt-1 tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[#9aa5b5]">Sample hours for this concept.</p>
          </div>
        </div>
      </section>

      <div className="container-site grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid content-start gap-4">
          <Wordmark tone="light" />
          <p className="max-w-[36ch] text-sm leading-relaxed">
            Used and nearly-new SUVs, pickups and sedans. Every car shows its full price
            and a monthly estimate.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className={heading}>Shop</h2>
          <ul className="grid gap-1 text-sm">
            {[...NAV_LINKS, TEST_DRIVE_LINK].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-block py-1.5 hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={heading}>About this site</h2>
          <p className="text-sm leading-relaxed">
            A concept website by David Tulio, shown with permission of INVECS Autocentrum.
            Listings and photos come from INVECS&apos;s Facebook page and may be out of date, so
            please confirm details with INVECS.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 text-xs text-[#9aa5b5]">
          <p>© {year} David Tulio · Concept website, not the official INVECS Autocentrum site.</p>
          <a href={OFFICIAL_SITE_URL} className="py-1 text-white underline underline-offset-2" rel="noopener">
            Official INVECS site
          </a>
        </div>
      </div>
    </footer>
  );
}
