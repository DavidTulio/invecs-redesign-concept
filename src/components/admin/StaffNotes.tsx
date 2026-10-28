"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { saveStaffNotes } from "@/actions/admin-inquiries";
import { STAFF_NOTES_MAX } from "@/lib/inquiry";
import { useHydrated } from "@/lib/use-hydrated";

/** Private notes on one inquiry, for staff only. Saved with a button, never automatically. */
export function StaffNotes({ id, initial, name }: { id: string; initial: string; name: string }) {
  const hydrated = useHydrated();
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const fieldId = `notes-${id}`;
  const changed = text.trim() !== saved.trim();

  return (
    <div className="grid gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold">
        Staff notes <span className="font-normal text-muted">(only admins see these)</span>
      </label>
      <textarea
        id={fieldId}
        rows={2}
        maxLength={STAFF_NOTES_MAX}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setMessage(null);
        }}
        placeholder={`e.g. Called ${name.split(" ")[0]} on 10/28, prefers Saturday morning`}
        className="w-full resize-y rounded-field border border-line bg-paper px-3 py-2 text-[15px] placeholder:text-muted/70 focus:border-ink"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!hydrated || pending || !changed}
          onClick={() =>
            startTransition(async () => {
              const result = await saveStaffNotes(id, text);
              if (result.ok) setSaved(text);
              setMessage({ ok: result.ok, text: result.ok ? "Notes saved" : (result.error ?? "Couldn't save.") });
            })
          }
          className="rounded-field border border-line px-3 py-1.5 text-sm font-semibold hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save notes"}
        </button>
        <p role="status" className={`flex items-center gap-1 text-sm ${message?.ok ? "text-ok" : "text-signal"}`}>
          {message?.ok && <Check aria-hidden size={14} />}
          {message?.text}
        </p>
      </div>
    </div>
  );
}
