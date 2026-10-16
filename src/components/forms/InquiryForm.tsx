"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitInquiry, type InquiryState } from "@/app/test-drive/actions";
import { formatPeso } from "@/lib/format";
import {
  CONTACT_METHOD_LABELS,
  CONTACT_METHODS,
  fieldErrors,
  makeInquirySchema,
  MESSAGE_MAX,
  type ContactMethod,
  type InquiryField,
} from "@/lib/inquiry";
import { Field, describedBy, inputClass } from "./Field";
import { Turnstile } from "./Turnstile";

export type CarOption = { slug: string; label: string; price: number; reserved: boolean };

const INITIAL: InquiryState = { status: "idle" };

export function InquiryForm({
  cars,
  defaultCar,
  formStamp,
  minDate,
  maxDate,
  siteKey,
}: {
  cars: CarOption[];
  defaultCar?: string;
  formStamp: string;
  minDate: string;
  maxDate: string;
  siteKey: string;
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL);
  const [clientErrors, setClientErrors] = useState<Partial<Record<InquiryField, string>> | null>(null);
  // A CAPTCHA token is single-use, so it only counts for the form it was issued to.
  const [issued, setIssued] = useState<{ token: string | null; attempt: number }>({ token: null, attempt: 0 });
  const formAttempt = state.attempt ?? 0;
  const token = issued.attempt === formAttempt ? issued.token : null;
  const [dismissedAttempt, setDismissedAttempt] = useState<number | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const values = state.status === "error" ? (state.values ?? {}) : {};
  const [method, setMethod] = useState<ContactMethod>((values.contact_method as ContactMethod) || "call");
  const [messageLength, setMessageLength] = useState((values.message ?? "").length);

  const errors = clientErrors ?? (state.status === "error" ? state.errors : undefined) ?? {};
  const serverMessage = state.status === "error" ? state.message : undefined;

  // Move focus to the error summary so keyboard and screen-reader users hear what went wrong.
  useEffect(() => {
    if (clientErrors || serverMessage) summaryRef.current?.focus();
  }, [clientErrors, serverMessage, state.attempt]);

  // Check in the browser first for instant feedback; the server checks again regardless.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = makeInquirySchema().safeParse(data);
    if (!result.success) {
      event.preventDefault();
      setClientErrors(fieldErrors(result.error));
      return;
    }
    setClientErrors(null);
  }

  if (state.status === "success" && dismissedAttempt !== state.attempt) {
    return (
      <div role="status" className="rounded-card border border-line p-6 sm:p-8">
        <CheckCircle2 aria-hidden size={32} className="text-ok" />
        <h2 className="font-wide mt-3 text-2xl font-bold">Request received</h2>
        <p className="mt-2 max-w-[55ch] text-ink-2">
          Thanks{state.message ? `, ${state.message}` : ""}. Your request is saved in this demo&apos;s
          admin inbox. On a live site, the dealer would now contact you by your chosen method.
        </p>
        <p className="mt-2 text-sm font-semibold text-warn">
          Demo: this message was not sent to INVECS Autocentrum.
        </p>
        <button
          type="button"
          onClick={() => {
            setDismissedAttempt(state.attempt ?? null);
          }}
          className="mt-6 rounded-field border border-line px-4 py-2.5 font-semibold hover:border-ink"
        >
          Send another request
        </button>
      </div>
    );
  }

  const phoneRequired = method === "call" || method === "viber";
  const emailRequired = method === "email";
  const errorCount = Object.keys(errors).length;

  return (
    // A new key after every server reply re-creates the form with the visitor's
    // values (React clears forms after an action) and a fresh single-use CAPTCHA.
    <form key={formAttempt} action={formAction} onSubmit={onSubmit} noValidate className="grid gap-5">
      <div ref={summaryRef} tabIndex={-1} className="outline-none" role="alert">
        {(serverMessage || errorCount > 0) && (
          <div className="rounded-field border border-signal/40 bg-[#fdecef] p-3 text-sm text-signal-dark">
            <p className="font-semibold">{serverMessage ?? "Please check the highlighted fields."}</p>
          </div>
        )}
      </div>

      <Field id="car" label="Car you're interested in" error={errors.car}>
        <select
          {...describedBy("car", errors.car)}
          name="car"
          defaultValue={values.car ?? defaultCar ?? ""}
          className={inputClass}
        >
          <option value="">No specific car / general question</option>
          {cars.map((car) => (
            <option key={car.slug} value={car.slug}>
              {car.label} · {formatPeso(car.price)}
              {car.reserved ? " (reserved)" : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field id="name" label="Your name" required error={errors.name}>
        <input
          {...describedBy("name", errors.name)}
          name="name"
          autoComplete="name"
          maxLength={80}
          defaultValue={values.name}
          className={inputClass}
        />
      </Field>

      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-sm font-semibold">
          How should we contact you?<span className="text-signal" aria-hidden> *</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONTACT_METHODS.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-field border border-line px-3 py-2.5 text-sm font-semibold has-[:checked]:border-ink has-[:checked]:bg-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal"
            >
              <input
                type="radio"
                name="contact_method"
                value={option}
                checked={method === option}
                onChange={() => setMethod(option)}
                className="accent-signal"
              />
              {CONTACT_METHOD_LABELS[option]}
            </label>
          ))}
        </div>
        {errors.contact_method && (
          <p id="contact_method-error" className="text-sm font-medium text-signal">
            {errors.contact_method}
          </p>
        )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="phone"
          label="Mobile number"
          required={phoneRequired}
          hint="PH mobile, like 0917 123 4567"
          error={errors.phone}
        >
          <input
            {...describedBy("phone", errors.phone, "hint")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            defaultValue={values.phone}
            className={inputClass}
          />
        </Field>
        <Field id="email" label="Email" required={emailRequired} error={errors.email}>
          <input
            {...describedBy("email", errors.email)}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            defaultValue={values.email}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        id="preferred_date"
        label="Preferred test-drive date"
        hint="We'll confirm the exact time with you."
        error={errors.preferred_date}
      >
        <input
          {...describedBy("preferred_date", errors.preferred_date, "hint")}
          name="preferred_date"
          type="date"
          min={minDate}
          max={maxDate}
          defaultValue={values.preferred_date}
          className={`${inputClass} sm:max-w-60`}
        />
      </Field>

      <Field id="message" label="Message" error={errors.message}>
        <textarea
          {...describedBy("message", errors.message)}
          name="message"
          rows={4}
          maxLength={MESSAGE_MAX}
          defaultValue={values.message}
          onChange={(event) => setMessageLength(event.target.value.length)}
          placeholder="Questions about the car, trade-in, or financing"
          className={`${inputClass} resize-y`}
        />
        <p className="text-right text-xs text-muted tabular-nums">
          {messageLength} / {MESSAGE_MAX}
        </p>
      </Field>

      {/* Honeypot: hidden from people and screen readers; bots tend to fill every field. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input type="hidden" name="form_stamp" value={formStamp} />

      <Turnstile
        siteKey={siteKey}
        action="inquiry"
        onTokenChange={(next) => setIssued({ token: next, attempt: formAttempt })}
      />

      <p className="text-xs leading-relaxed text-muted">
        <strong className="font-semibold text-ink-2">Privacy:</strong> we only use these details to answer
        this request. They are deleted automatically after 30 days and are never shared.
      </p>

      <button
        type="submit"
        disabled={pending || !token}
        className="flex items-center justify-center gap-2 rounded-field bg-signal px-6 py-3.5 font-semibold text-white hover:bg-signal-dark disabled:cursor-not-allowed disabled:bg-muted sm:justify-self-start"
      >
        <Send aria-hidden size={18} />
        {pending ? "Sending…" : token ? "Send request" : "Checking you're human…"}
      </button>
    </form>
  );
}
