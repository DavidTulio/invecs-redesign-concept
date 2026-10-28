"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { saveCar, type CarFormState } from "@/actions/admin-cars";
import { useHydrated } from "@/lib/use-hydrated";
import { Field, describedBy, inputClass } from "@/components/forms/Field";
import { FEATURED_MAX, MAX_FEATURES } from "@/lib/car-schema";
import { BODY_TYPE_LABELS, BODY_TYPES, FUEL_LABELS, FUELS, TRANSMISSION_LABELS, TRANSMISSIONS } from "@/lib/types";

export type CarFormValues = {
  id?: string;
  make: string;
  model: string;
  variant: string;
  year: string;
  body_type: string;
  transmission: string;
  fuel: string;
  mileage_km: string;
  price_php: string;
  color: string;
  description: string;
  features: string;
  status: string;
  /** "yes" when the car is featured on the home page. */
  featured: string;
};

export function CarForm({ initial }: { initial: CarFormValues }) {
  const [state, formAction, pending] = useActionState(saveCar, { status: "idle" } as CarFormState);
  const hydrated = useHydrated();
  // Inputs start from the saved values and then keep whatever the admin types.
  const v = initial;
  const e = state.errors ?? {};

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  const text = (name: keyof CarFormValues, label: string, opts: { required?: boolean; hint?: string; inputMode?: "numeric" } = {}) => (
    <Field id={name} label={label} required={opts.required} hint={opts.hint} error={e[name as keyof typeof e]}>
      <input
        {...describedBy(name, e[name as keyof typeof e], opts.hint)}
        name={name}
        inputMode={opts.inputMode}
        defaultValue={v[name]}
        className={inputClass}
      />
    </Field>
  );

  const select = (name: keyof CarFormValues, label: string, options: readonly string[], labels: Record<string, string>) => (
    <Field id={name} label={label} required error={e[name as keyof typeof e]}>
      <select {...describedBy(name, e[name as keyof typeof e])} name={name} defaultValue={v[name]} className={inputClass}>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </Field>
  );

  return (
    // Submitting through a handler (not <form action>) stops React from clearing the
    // inputs after each save, so a failed save keeps everything the admin typed.
    <form onSubmit={submit} noValidate className="grid gap-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div role="status">
        {state.message && (
          <p
            className={`rounded-field p-3 text-sm font-semibold ${
              state.status === "error" ? "border border-signal/40 bg-[#fdecef] text-signal-dark" : "bg-[#e6f4ed] text-ok"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-semibold">The car</legend>
        {text("make", "Make", { required: true })}
        {text("model", "Model", { required: true })}
        {text("variant", "Variant", { hint: "e.g. 2.8 V 4x4" })}
        {text("year", "Year", { required: true, inputMode: "numeric" })}
        {select("body_type", "Body type", BODY_TYPES, BODY_TYPE_LABELS)}
        {text("color", "Colour")}
        {select("transmission", "Transmission", TRANSMISSIONS, TRANSMISSION_LABELS)}
        {select("fuel", "Fuel", FUELS, FUEL_LABELS)}
        {text("mileage_km", "Mileage (km)", { required: true, inputMode: "numeric" })}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-semibold">Price and status</legend>
        {text("price_php", "Price (₱)", { required: true, inputMode: "numeric", hint: "Commas are fine: 1,250,000" })}
        {select("status", "Status", ["available", "reserved", "sold"], {
          available: "Available",
          reserved: "Reserved",
          sold: "Sold",
        })}
        <div className="grid content-start gap-1.5 sm:col-span-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold">
            <input
              type="checkbox"
              name="featured"
              value="yes"
              defaultChecked={v.featured === "yes"}
              aria-describedby={e.featured ? "featured-error" : "featured-hint"}
              aria-invalid={e.featured ? true : undefined}
              className="size-5 accent-[var(--color-ink)]"
            />
            Feature on the home page
          </label>
          {e.featured ? (
            <p id="featured-error" className="text-sm font-medium text-signal">
              {e.featured}
            </p>
          ) : (
            <p id="featured-hint" className="text-xs text-muted">
              Shown first in &ldquo;Latest arrivals&rdquo;, up to {FEATURED_MAX} cars. Sold cars are removed automatically.
            </p>
          )}
        </div>
      </fieldset>

      <Field id="description" label="Description" error={e.description}>
        <textarea
          {...describedBy("description", e.description)}
          name="description"
          rows={5}
          defaultValue={v.description}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field
        id="features"
        label="Features"
        hint={`One per line, up to ${MAX_FEATURES}. All of them are shown on the car page.`}
        error={e.features}
      >
        <textarea
          {...describedBy("features", e.features, "hint")}
          name="features"
          rows={7}
          defaultValue={v.features}
          className={`${inputClass} resize-y font-mono text-sm`}
        />
      </Field>

      <button
        type="submit"
        disabled={pending || !hydrated}
        className="flex items-center justify-center gap-2 justify-self-start rounded-field bg-ink px-5 py-3 font-semibold text-white hover:bg-ink-2 disabled:opacity-60"
      >
        <Save aria-hidden size={18} />
        {pending ? "Saving…" : initial.id ? "Save changes" : "Add car"}
      </button>
    </form>
  );
}
