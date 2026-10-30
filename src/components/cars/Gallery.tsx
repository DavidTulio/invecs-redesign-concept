"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { BodyType, CarPhoto } from "@/lib/types";
import { CarImage } from "./CarImage";

const SIZES = "(min-width: 1024px) 720px, 100vw";

/**
 * Swipeable photo gallery. Swiping uses the browser's own scroll-snap, so it is
 * smooth on phones with no library. Arrow buttons and thumbnails do the same on desktop.
 * Tapping a photo opens it full screen (a native <dialog>: Esc closes it, focus stays inside).
 */
export function Gallery({ photos, bodyType, title }: { photos: CarPhoto[]; bodyType: BodyType; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const fullTrack = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [fullIndex, setFullIndex] = useState(0);
  const many = photos.length > 1;

  const scrollTo = (el: HTMLDivElement | null, next: number, smooth = true) => {
    if (!el) return;
    const clamped = Math.max(0, Math.min(photos.length - 1, next));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: smooth ? "smooth" : "instant" });
  };
  const goTo = (next: number) => scrollTo(track.current, next);
  const fullGoTo = (next: number) => scrollTo(fullTrack.current, next);
  const position = (el: HTMLDivElement | null) => (el ? Math.round(el.scrollLeft / el.clientWidth) : 0);

  function openFull(i: number) {
    dialog.current?.showModal();
    setFullIndex(i);
    // Wait one frame so the dialog has its size before jumping to the photo.
    requestAnimationFrame(() => scrollTo(fullTrack.current, i, false));
  }

  const current = photos[index];
  const last = photos.length - 1;

  return (
    <section aria-roledescription="carousel" aria-label={`Photos of the ${title}`}>
      <div className="relative overflow-hidden rounded-card bg-soft">
        <div
          ref={track}
          onScroll={many ? () => setIndex(position(track.current)) : undefined}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={many ? 0 : undefined}
          aria-label={many ? "Photo track. Swipe or use the arrow buttons." : undefined}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") goTo(index + 1);
            if (event.key === "ArrowLeft") goTo(index - 1);
          }}
        >
          {(photos.length ? photos : [undefined]).map((photo, i) => (
            <div
              key={photo?.path ?? "placeholder"}
              className="relative aspect-[4/3] w-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={many ? `${i + 1} of ${photos.length}` : undefined}
            >
              {/* Whole image, never cropped: listing posters carry the car's name and details. */}
              <CarImage photo={photo} bodyType={bodyType} sizes={SIZES} preload={i === 0} fit="contain" />
              {photo && (
                <button
                  type="button"
                  onClick={() => openFull(i)}
                  className="absolute inset-0 cursor-zoom-in"
                  aria-label={`View photo ${i + 1} full screen`}
                />
              )}
            </div>
          ))}
        </div>

        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => openFull(index)}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink"
          >
            <Expand aria-hidden size={14} />
            Full view
          </button>
        )}
        {many && (
          <>
            <GalleryButton side="left" tone="light" disabled={index === 0} onClick={() => goTo(index - 1)} />
            <GalleryButton side="right" tone="light" disabled={index === last} onClick={() => goTo(index + 1)} />
            <p className="absolute right-3 bottom-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white tabular-nums">
              {index + 1} / {photos.length}
            </p>
          </>
        )}
      </div>

      {many && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {photos.map((photo, i) => (
            <button
              key={photo.path}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-field border-2 ${
                i === index ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <CarImage photo={{ ...photo, alt: "" }} bodyType={bodyType} sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {current?.credit_name && <PhotoCredit photo={current} />}

      {/* Full view: the photos as large as the screen allows, swipe or arrows to move. */}
      <dialog
        ref={dialog}
        aria-label={`Photos of the ${title}, full screen`}
        onClose={() => goTo(fullIndex)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") fullGoTo(fullIndex + 1);
          if (event.key === "ArrowLeft") fullGoTo(fullIndex - 1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#0b0f16] p-0 text-white backdrop:bg-black/80"
      >
        <div
          ref={fullTrack}
          onScroll={() => setFullIndex(position(fullTrack.current))}
          className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, i) => (
            <div key={photo.path} className="relative h-full w-full shrink-0 snap-center" aria-label={`${i + 1} of ${photos.length}`}>
              <CarImage photo={photo} bodyType={bodyType} sizes="100vw" fit="contain" />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="absolute top-3 right-3 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/15 px-4 font-semibold text-white hover:bg-white/25"
          autoFocus
        >
          <X aria-hidden size={18} />
          Close
        </button>
        {many && (
          <>
            <GalleryButton side="left" tone="dark" disabled={fullIndex === 0} onClick={() => fullGoTo(fullIndex - 1)} />
            <GalleryButton side="right" tone="dark" disabled={fullIndex === last} onClick={() => fullGoTo(fullIndex + 1)} />
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold tabular-nums">
              {fullIndex + 1} / {photos.length}
            </p>
          </>
        )}
      </dialog>
    </section>
  );
}

function PhotoCredit({ photo }: { photo: CarPhoto }) {
  const unsplash = photo.credit_url?.includes("unsplash.com");
  return (
    <p className="mt-2 text-xs text-muted">
      Photo:{" "}
      {photo.credit_url ? (
        <a href={photo.credit_url} className="underline underline-offset-2" rel="noopener">
          {photo.credit_name}
          {unsplash && " on Unsplash"}
        </a>
      ) : (
        photo.credit_name
      )}
      {unsplash ? ". Sample photo of the same model." : ". Used with permission."}
    </p>
  );
}

function GalleryButton({
  side,
  tone,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  tone: "light" | "dark";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 ${side === "left" ? "left-3" : "right-3"} hidden size-11 -translate-y-1/2 place-items-center rounded-full transition-opacity disabled:opacity-0 sm:grid ${
        tone === "light" ? "bg-paper/90 text-ink shadow hover:bg-paper" : "bg-white/15 text-white hover:bg-white/25"
      }`}
    >
      <Icon aria-hidden size={22} />
    </button>
  );
}
