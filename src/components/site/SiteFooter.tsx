import Link from "next/link";
import { NAV_LINKS, OFFICIAL_SITE_URL, TEST_DRIVE_LINK } from "@/lib/site";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-[#c9d1dd]">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid content-start gap-4">
          <Wordmark tone="light" />
          <p className="max-w-[36ch] text-sm leading-relaxed">
            Used and nearly-new SUVs, pickups and sedans. Every car shows its full price
            and a monthly estimate.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase">Shop</h2>
          <ul className="grid gap-2 text-sm">
            {[...NAV_LINKS, TEST_DRIVE_LINK].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-xs font-semibold tracking-[0.12em] text-white uppercase">
            About this site
          </h2>
          <p className="text-sm leading-relaxed">
            A portfolio concept by David Tulio. Cars and prices are sample data. Photos are
            free-licence images, credited in the project README.{" "}
            <a href={OFFICIAL_SITE_URL} className="text-white underline underline-offset-2" rel="noopener">
              Official INVECS site
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-site py-4 text-xs text-[#9aa5b5]">
          Unofficial redesign concept. Not affiliated with INVECS Autocentrum.
        </p>
      </div>
    </footer>
  );
}
