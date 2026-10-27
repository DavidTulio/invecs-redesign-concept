"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Opens the phone's own share menu (Messenger, Viber, SMS…). Where there is no
 * share menu, it copies the link instead. No third-party scripts, so no tracking.
 */
export function ShareButton({
  path,
  title,
  text,
  label = "Share",
  className = "",
}: {
  path: string;
  title: string;
  text: string;
  label?: string;
  className?: string;
}) {
  const hydrated = useHydrated();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return; // the visitor closed the menu
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <>
      <button
        type="button"
        disabled={!hydrated}
        onClick={share}
        className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-colors disabled:opacity-60 ${className}`}
      >
        {status === "copied" ? <Check aria-hidden size={18} /> : <Share2 aria-hidden size={18} />}
        {status === "copied" ? "Link copied" : label}
      </button>
      <span role="status" className="sr-only">
        {status === "copied" ? "Link copied" : status === "failed" ? "Couldn't copy the link. Copy it from the address bar." : ""}
      </span>
    </>
  );
}
