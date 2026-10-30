import type { ReactNode } from "react";

/** Label, optional hint and error message wired to one input via ids. */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required ? (
          <span className="text-signal" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-semibold text-signal">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full rounded-field border border-line bg-paper px-3 py-2.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-ink aria-[invalid=true]:border-signal";

/** aria props for an input inside <Field>. */
export function describedBy(id: string, error?: string, hint?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}
