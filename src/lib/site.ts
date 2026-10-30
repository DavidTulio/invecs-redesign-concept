export const OFFICIAL_SITE_URL = "https://www.invecs.ph/";

/** This concept's own address, for absolute links in shares and link previews. */
export const SITE_URL = "https://invecs-redesign-concept.vercel.app";

export const SITE_NAME = "INVECS Autocentrum";

export const NAV_LINKS = [
  { href: "/inventory", label: "Inventory" },
  { href: "/services", label: "Services" },
  { href: "/loan-calculator", label: "Loan calculator" },
  { href: "/branches", label: "Branches & contact" },
] as const;

export const TEST_DRIVE_LINK = { href: "/test-drive", label: "Book a test drive" } as const;

/**
 * Concept safeguard. While true, inquiries are saved for the demo admin only and
 * contact buttons explain the demo instead of dialling the real dealer.
 * Set NEXT_PUBLIC_DEMO_MODE=false only if INVECS adopts this site.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/** The dealer's official contact details, from invecs.ph/contact-us. Shown as plain text only. */
export const OFFICIAL_CONTACT = {
  phones: ["+63 920 963 3858", "+63 917 510 3858", "+63 945 963 3858", "+63 922 338 9885"],
  emails: ["invecsauto@gmail.com", "invecsauto@yahoo.com"],
  facebook: "https://www.facebook.com/Invecs-Autocentrum-142362912502027/",
} as const;
