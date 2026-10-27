import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";
import { ConceptBanner } from "@/components/site/ConceptBanner";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "INVECS Autocentrum (redesign concept)",
    template: "%s · INVECS Autocentrum (redesign concept)",
  },
  description:
    "Unofficial portfolio redesign concept of INVECS Autocentrum's used-car website by David Tulio. Not affiliated with INVECS Autocentrum.",
  openGraph: { siteName: "INVECS Autocentrum (redesign concept)", locale: "en_PH", type: "website" },
  // Concept safeguard: keep every page out of search engines.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1a2b",
};

/** Shared by every page, public and admin: fonts, skip link and the concept banner. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-PH" className={`${archivo.variable} ${plex.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-field bg-ink px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <ConceptBanner />
        {children}
      </body>
    </html>
  );
}
