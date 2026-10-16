import Link from "next/link";
import { NAV_LINKS, TEST_DRIVE_LINK } from "@/lib/site";
import { MobileNav } from "./MobileNav";
import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[15px] text-ink-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="py-2 hover:text-signal">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={TEST_DRIVE_LINK.href}
            className="hidden rounded-field bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-dark sm:inline-block"
          >
            {TEST_DRIVE_LINK.label}
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
