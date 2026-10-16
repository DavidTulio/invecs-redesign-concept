import type { MetadataRoute } from "next";

// Concept safeguard: ask every crawler to stay out of the whole site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
