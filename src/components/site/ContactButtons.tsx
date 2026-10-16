"use client";

import { useState } from "react";
import { Mail, MessageCircle, Phone, Smartphone } from "lucide-react";
import type { Branch } from "@/lib/data/branches";
import { DEMO_MODE } from "@/lib/site";

const digits = (phone: string) => phone.replace(/[^\d+]/g, "");

/**
 * Real tap-to-call, Viber, Messenger and email links (fixing the original's broken
 * "Call Us Today" button). In demo mode they explain the demo instead of contacting
 * the real dealer, as the concept rules require.
 */
export function ContactButtons({ branch }: { branch: Branch }) {
  const [demoOpen, setDemoOpen] = useState(false);

  const actions = [
    { label: "Call", icon: Phone, href: `tel:${digits(branch.phone)}`, primary: true },
    branch.viber_phone && {
      label: "Viber",
      icon: Smartphone,
      href: `viber://chat?number=${encodeURIComponent(digits(branch.viber_phone))}`,
    },
    branch.messenger_url && { label: "Messenger", icon: MessageCircle, href: branch.messenger_url },
    branch.email && { label: "Email", icon: Mail, href: `mailto:${branch.email}` },
  ].filter(Boolean) as { label: string; icon: typeof Phone; href: string; primary?: boolean }[];

  const className = (primary?: boolean) =>
    `flex items-center justify-center gap-2 rounded-field px-4 py-3 font-semibold ${
      primary ? "bg-signal text-white hover:bg-signal-dark" : "border border-line hover:border-ink"
    }`;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ label, icon: Icon, href, primary }) =>
          DEMO_MODE ? (
            <button
              key={label}
              type="button"
              className={className(primary)}
              aria-expanded={demoOpen}
              aria-controls={`demo-${branch.id}`}
              onClick={() => setDemoOpen(true)}
            >
              <Icon aria-hidden size={18} />
              {label}
            </button>
          ) : (
            <a key={label} href={href} className={className(primary)} rel="noopener">
              <Icon aria-hidden size={18} />
              {label}
            </a>
          ),
        )}
      </div>
      {DEMO_MODE && demoOpen && (
        <p id={`demo-${branch.id}`} role="status" className="mt-3 rounded-field bg-[#fff8e6] p-3 text-sm text-ink-2">
          <strong className="font-semibold text-ink">Demo:</strong> on a live site this button opens your
          phone, Viber, Messenger or email app with the showroom filled in. It&apos;s switched off here so
          this concept never contacts the real dealer. Use the official contacts listed above instead.
        </p>
      )}
    </div>
  );
}
