import { Info } from "lucide-react";
import { OFFICIAL_CONTACT } from "@/lib/site";

/**
 * Concept safeguard: tells visitors their message won't reach the dealer, and gives
 * real buyers the official contact details as plain text (no tap-to-call).
 */
export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <aside aria-label="Demo notice" className="flex gap-3 rounded-card border border-[#f0d58a] bg-[#fff8e6] p-4 text-sm leading-relaxed text-ink">
      <Info aria-hidden size={20} className="mt-0.5 shrink-0 text-warn" />
      <div className="min-w-0">
        <p className="font-semibold">{children}</p>
        <p className="mt-1 text-ink-2">
          To reach INVECS Autocentrum for real, use their official contacts:{" "}
          {OFFICIAL_CONTACT.phones.map((phone) => (
            <span key={phone}>
              <span className="whitespace-nowrap tabular-nums select-all">{phone}</span>
              {" · "}
            </span>
          ))}
          <span className="whitespace-nowrap select-all">{OFFICIAL_CONTACT.emails[0]}</span>
        </p>
      </div>
    </aside>
  );
}
