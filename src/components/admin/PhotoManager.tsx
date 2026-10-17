"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import { deletePhoto, movePhoto, updatePhotoAlt, uploadPhoto } from "@/actions/admin-cars";
import { PHOTO_MAX_BYTES } from "@/lib/car-schema";
import { useHydrated } from "@/lib/use-hydrated";
import { ConfirmButton } from "./ui";

export type ManagedPhoto = { id: string; url: string; alt: string };

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function PhotoManager({ carId, photos }: { carId: string; photos: ManagedPhoto[] }) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, startTransition] = useTransition();
  const hydrated = useHydrated();
  const pending = busy || !hydrated;

  // Files go up one at a time so each request stays under the server's size limit.
  // The browser checks size and type for quick feedback; the server checks again.
  function upload(files: FileList) {
    const list = [...files];
    startTransition(async () => {
      const problems: string[] = [];
      for (const [index, file] of list.entries()) {
        setProgress(`Uploading ${index + 1} of ${list.length}…`);
        if (!ACCEPT.includes(file.type)) {
          problems.push(`${file.name} isn't a JPG, PNG or WebP image.`);
          continue;
        }
        if (file.size > PHOTO_MAX_BYTES) {
          problems.push(`${file.name} is larger than 5 MB.`);
          continue;
        }
        const data = new FormData();
        data.set("photo", file);
        const result = await uploadPhoto(carId, data);
        if (!result.ok) problems.push(result.error);
      }
      setErrors(problems);
      setProgress(null);
      if (input.current) input.current.value = "";
    });
  }

  return (
    <section aria-labelledby={`${inputId}-title`} className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${inputId}-title`} className="font-wide text-xl font-bold">
          Photos <span className="text-base font-normal text-muted">({photos.length})</span>
        </h2>
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-center gap-2 rounded-field bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal"
        >
          <Upload aria-hidden size={16} />
          Upload photos
          <input
            ref={input}
            id={inputId}
            type="file"
            accept={ACCEPT.join(",")}
            multiple
            disabled={pending}
            onChange={(event) => event.target.files?.length && upload(event.target.files)}
            className="sr-only"
          />
        </label>
      </div>
      <p className="text-sm text-muted">JPG, PNG or WebP, up to 5 MB each. The first photo is the cover on the website.</p>

      <div role="status" aria-live="polite">
        {progress && <p className="text-sm font-semibold">{progress}</p>}
        {errors.length > 0 && (
          <ul className="rounded-field border border-signal/40 bg-[#fdecef] p-3 text-sm text-signal-dark">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-paper p-8 text-center text-muted">
          No photos yet. The website shows a placeholder until you add one.
        </p>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} total={photos.length} />
          ))}
        </ol>
      )}
    </section>
  );
}

function PhotoCard({ photo, index, total }: { photo: ManagedPhoto; index: number; total: number }) {
  const [busy, startTransition] = useTransition();
  const hydrated = useHydrated();
  const pending = busy || !hydrated;
  const altId = useId();
  const run = (action: () => Promise<unknown>) => startTransition(async () => void (await action()));
  const iconButton =
    "grid size-9 place-items-center rounded-field border border-line bg-paper hover:border-ink disabled:opacity-40";

  return (
    <li className={`grid gap-3 rounded-card border border-line bg-paper p-3 ${pending ? "opacity-60" : ""}`}>
      <div className="relative aspect-[3/2] overflow-hidden rounded-field bg-soft">
        <Image src={photo.url} alt={photo.alt} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />
        <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
          {index === 0 ? "Cover" : `#${index + 1}`}
        </span>
      </div>

      <form action={(data) => run(() => updatePhotoAlt(photo.id, data))} className="grid gap-1.5">
        <label htmlFor={altId} className="text-xs font-semibold text-ink-2">
          Description for screen readers
        </label>
        <div className="flex gap-2">
          <input
            id={altId}
            name="alt"
            defaultValue={photo.alt}
            maxLength={200}
            required
            className="min-w-0 flex-1 rounded-field border border-line px-2.5 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-field border border-line px-3 text-sm font-semibold hover:border-ink disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={iconButton}
          disabled={pending || index === 0}
          onClick={() => run(() => movePhoto(photo.id, "up"))}
          aria-label="Move photo earlier"
        >
          <ArrowUp aria-hidden size={16} />
        </button>
        <button
          type="button"
          className={iconButton}
          disabled={pending || index === total - 1}
          onClick={() => run(() => movePhoto(photo.id, "down"))}
          aria-label="Move photo later"
        >
          <ArrowDown aria-hidden size={16} />
        </button>
        {index > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => movePhoto(photo.id, "first"))}
            className="flex h-9 items-center gap-1.5 rounded-field border border-line px-3 text-sm font-semibold hover:border-ink"
          >
            <Star aria-hidden size={14} />
            Make cover
          </button>
        )}
        <span className="ml-auto">
          <ConfirmButton
            label={
              <span className="flex h-9 items-center gap-1.5 px-2 text-sm font-semibold text-signal">
                <Trash2 aria-hidden size={14} />
                Delete
              </span>
            }
            confirmLabel="Delete photo"
            onConfirm={() => deletePhoto(photo.id)}
          />
        </span>
      </div>
    </li>
  );
}
