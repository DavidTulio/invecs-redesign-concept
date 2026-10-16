"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BodyType, CarPhoto } from "@/lib/types";
import { CarImage } from "./CarImage";

const SIZES = "(min-width: 1024px) 720px, 100vw";

/**
 * Swipeable photo gallery. Swiping uses the browser's own scroll-snap, so it is
 * smooth on phones with no library. Arrow buttons and thumbnails do the same on desktop.
 */
export function Gallery({ photos, bodyType, title }: { photos: CarPhoto[]; bodyType: BodyType; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const many = photos.length > 1;

  function goTo(next: number) {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(photos.length - 1, next));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  const current = photos[index];

  return (
    <section aria-roledescription="carousel" aria-label={`Photos of the ${title}`}>
      <div className="relative overflow-hidden rounded-card bg-soft">
        <div
          ref={track}
          onScroll={many ? onScroll : undefined}
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
              className="relative aspect-[3/2] w-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={many ? `${i + 1} of ${photos.length}` : undefined}
            >
              <CarImage photo={photo} bodyType={bodyType} sizes={SIZES} preload={i === 0} />
            </div>
          ))}
        </div>

        {many && (
          <>
            <GalleryButton side="left" disabled={index === 0} onClick={() => goTo(index - 1)} />
            <GalleryButton side="right" disabled={index === photos.length - 1} onClick={() => goTo(index + 1)} />
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
              className={`relative aspect-[3/2] w-20 shrink-0 overflow-hidden rounded-field border-2 ${
                i === index ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <CarImage photo={{ ...photo, alt: "" }} bodyType={bodyType} sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {current?.credit_name && (
        <p className="mt-2 text-xs text-muted">
          Photo:{" "}
          {current.credit_url ? (
            <a href={current.credit_url} className="underline underline-offset-2" rel="noopener">
              {current.credit_name} on Unsplash
            </a>
          ) : (
            current.credit_name
          )}
          . Sample photo of the same model.
        </p>
      )}
    </section>
  );
}

function GalleryButton({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 ${side === "left" ? "left-3" : "right-3"} hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow transition-opacity hover:bg-paper disabled:opacity-0 sm:grid`}
    >
      <Icon aria-hidden size={22} />
    </button>
  );
}
