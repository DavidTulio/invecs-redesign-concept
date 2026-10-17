"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useHydrated } from "@/lib/use-hydrated";

/** Two-step button for destructive actions: the first click asks, the second does it. */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  className = "",
}: {
  label: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<unknown>;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const hydrated = useHydrated();
  const [pending, startTransition] = useTransition();

  if (!asking) {
    return (
      <button type="button" disabled={!hydrated} onClick={() => setAsking(true)} className={className}>
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => void (await onConfirm()))}
        className="rounded-field bg-signal px-3 py-2 text-sm font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
      >
        {pending ? "Working…" : confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="rounded-field px-3 py-2 text-sm font-semibold text-ink-2 hover:bg-soft"
      >
        Cancel
      </button>
    </span>
  );
}

/** A status dropdown that saves as soon as it changes. */
export function StatusSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => Promise<unknown>;
}) {
  const [current, setCurrent] = useState(value);
  const hydrated = useHydrated();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <span className="inline-flex items-center gap-2">
      <select
        aria-label={label}
        value={current}
        disabled={pending || !hydrated}
        onChange={(event) => {
          const next = event.target.value;
          const previous = current;
          setCurrent(next);
          setFailed(false);
          startTransition(async () => {
            try {
              await onChange(next);
            } catch {
              setCurrent(previous);
              setFailed(true);
            }
          });
        }}
        className="rounded-field border border-line bg-paper py-1.5 pr-8 pl-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {pending && <span className="text-xs text-muted">Saving…</span>}
      {failed && (
        <span role="alert" className="text-xs font-semibold text-signal">
          Not saved
        </span>
      )}
    </span>
  );
}
