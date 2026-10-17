import type { Metadata } from "next";

// Admin pages are per-user and per-request (they read the login cookie), so they
// opt out of instant-navigation pre-rendering and always render on the server.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · INVECS concept" },
};

/** Admin area: plain background, no public header or footer. */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main id="main" className="flex-1 bg-soft">
      {children}
    </main>
  );
}
