"use client";

import { useActionState, useState } from "react";
import { LogIn } from "lucide-react";
import { signIn, type LoginState } from "@/actions/admin-auth";
import { Field, inputClass } from "@/components/forms/Field";
import { Turnstile } from "@/components/forms/Turnstile";

export function LoginForm({ siteKey, notice }: { siteKey: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, {} as LoginState);
  const formAttempt = state.attempt ?? 0;
  const [issued, setIssued] = useState<{ token: string | null; attempt: number }>({ token: null, attempt: 0 });
  const token = issued.attempt === formAttempt ? issued.token : null;
  const message = state.error ?? notice;

  return (
    <form key={formAttempt} action={formAction} className="grid gap-4">
      <div role="alert">
        {message && (
          <p className="rounded-field border border-signal/40 bg-[#fdecef] p-3 text-sm font-semibold text-signal-dark">
            {message}
          </p>
        )}
      </div>
      <Field id="email" label="Email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </Field>
      <Field id="password" label="Password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <Turnstile
        siteKey={siteKey}
        action="login"
        onTokenChange={(next) => setIssued({ token: next, attempt: formAttempt })}
      />
      <button
        type="submit"
        disabled={pending || !token}
        className="flex items-center justify-center gap-2 rounded-field bg-ink px-4 py-3 font-semibold text-white hover:bg-ink-2 disabled:cursor-not-allowed disabled:bg-muted"
      >
        <LogIn aria-hidden size={18} />
        {pending ? "Signing in…" : token ? "Sign in" : "Checking you're human…"}
      </button>
    </form>
  );
}
