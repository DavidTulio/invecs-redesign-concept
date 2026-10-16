"use client";

import { useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** A native <select> with a visible label inside the box. Native selects work best on phones. */
export function SelectField({
  label,
  name,
  value,
  onChange,
  disabled,
  hint,
  bordered = false,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
  bordered?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div
      className={`relative min-w-0 rounded-field bg-paper has-[select:disabled]:bg-soft/60 ${
        bordered ? "border border-line focus-within:border-ink" : ""
      }`}
    >
      <label htmlFor={id} className="block px-3 pt-2 text-xs text-muted">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none truncate bg-transparent pt-0.5 pr-9 pb-2.5 pl-3 text-[15px] font-semibold text-ink outline-offset-0 disabled:cursor-not-allowed disabled:text-muted"
      >
        {children}
      </select>
      <ChevronDown aria-hidden size={18} className="pointer-events-none absolute right-3 bottom-3 text-muted" />
      {hint && (
        <p id={hintId} className="px-3 pb-2 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
