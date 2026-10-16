"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Cloudflare Turnstile: a privacy-friendly "I'm human" check. Most visitors pass
 * without clicking anything. It adds a hidden `cf-turnstile-response` field to the
 * surrounding form; the server sends that token to Cloudflare to verify it.
 */
export function Turnstile({
  siteKey,
  action,
  onTokenChange,
}: {
  siteKey: string;
  action: string;
  onTokenChange: (token: string | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(() => typeof window !== "undefined" && !!window.turnstile);
  const onTokenRef = useRef(onTokenChange);

  useEffect(() => {
    onTokenRef.current = onTokenChange;
  });

  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return;
    const widgetId = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action,
      theme: "light",
      size: "flexible",
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => onTokenRef.current(null),
    });
    return () => window.turnstile?.remove(widgetId);
  }, [ready, siteKey, action]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={container} className="min-h-[65px]" />
    </>
  );
}
