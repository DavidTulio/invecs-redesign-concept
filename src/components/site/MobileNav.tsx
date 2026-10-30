"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, TEST_DRIVE_LINK } from "@/lib/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState(pathname);

  // Close the menu after navigating to another page.
  if (open && openedOn !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="-mr-2 grid size-11 place-items-center rounded-field text-ink hover:bg-soft"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => {
          setOpenedOn(pathname);
          setOpen((value) => !value);
        }}
      >
        {open ? <X aria-hidden size={22} /> : <Menu aria-hidden size={22} />}
      </button>

      <nav
        id="mobile-menu"
        aria-label="Main"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-[0_12px_24px_-12px_rgb(14_26_43/0.25)]"
      >
        <ul className="container-site grid py-2">
          {/* Phones only: some visitors don't know the logo goes home. The desktop bar keeps the logo alone. */}
          {[{ href: "/", label: "Home" }, ...NAV_LINKS].map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link href={link.href} className="block py-3.5 text-base text-ink">
                {link.label}
              </Link>
            </li>
          ))}
          <li className="py-3">
            <Link
              href={TEST_DRIVE_LINK.href}
              className="block rounded-field bg-signal px-4 py-3 text-center font-semibold text-white"
            >
              {TEST_DRIVE_LINK.label}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
