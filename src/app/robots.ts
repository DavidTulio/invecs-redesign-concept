import type { MetadataRoute } from "next";

// Chat apps' link-preview robots, so a car shared on Messenger or Viber shows its
// photo, name and price. They may read public pages only; every page still says
// "noindex", so nothing ends up in a search index.
const LINK_PREVIEW_BOTS = ["facebookexternalhit", "Facebot", "Viber", "WhatsApp", "TelegramBot"];

// Concept safeguard: every other crawler (search engines, scrapers) stays out of the whole site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: LINK_PREVIEW_BOTS, allow: "/", disallow: "/admin" },
      { userAgent: "*", disallow: "/" },
    ],
  };
}
