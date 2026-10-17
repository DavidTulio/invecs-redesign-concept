"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, ExternalLink, Inbox, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/cars", label: "Cars", icon: Car },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
];

/** Highlights the current section. Reads the URL, so it sits inside <Suspense>. */
export function AdminNav() {
  return <AdminNavList pathname={usePathname()} />;
}

/** The same menu without the URL; also used as the fallback while the URL is read. */
export function AdminNavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Admin" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-1 text-sm font-semibold whitespace-nowrap">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = pathname !== null && (exact ? pathname === href : pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-field px-3 py-2 ${
                  active ? "bg-ink text-white" : "text-ink-2 hover:bg-soft"
                }`}
              >
                <Icon aria-hidden size={16} />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link href="/" className="flex items-center gap-2 rounded-field px-3 py-2 text-ink-2 hover:bg-soft">
            <ExternalLink aria-hidden size={16} />
            View site
          </Link>
        </li>
      </ul>
    </nav>
  );
}
