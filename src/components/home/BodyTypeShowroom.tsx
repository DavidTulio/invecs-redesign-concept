"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Rotate3d } from "lucide-react";
import hatchbackPoster from "@/assets/showroom/hatchback.webp";
import pickupPoster from "@/assets/showroom/pickup.webp";
import sedanPoster from "@/assets/showroom/sedan.webp";
import suvPoster from "@/assets/showroom/suv.webp";
import vanPoster from "@/assets/showroom/van.webp";
import { CarSilhouette } from "@/components/cars/CarSilhouette";
import { formatPesoShort } from "@/lib/format";
import type { BodyTypeSummary } from "@/lib/inventory";
import { useHydrated } from "@/lib/use-hydrated";
import { BODY_TYPE_LABELS, type BodyType } from "@/lib/types";

// Grey models cut from "Generic passenger car pack" (CC BY 4.0), about 200 KB each.
const MODELS: Partial<Record<BodyType, { src: string; poster: StaticImageData }>> = {
  suv: { src: "/models/suv.glb", poster: suvPoster },
  pickup: { src: "/models/pickup.glb", poster: pickupPoster },
  sedan: { src: "/models/sedan.glb", poster: sedanPoster },
  hatchback: { src: "/models/hatchback.glb", poster: hatchbackPoster },
  van: { src: "/models/van.glb", poster: vanPoster },
};

const PLURAL: Record<BodyType, string> = {
  suv: "SUVs and AUVs",
  pickup: "pickups",
  sedan: "sedans",
  hatchback: "hatchbacks",
  van: "vans",
};
const ARTICLE: Record<BodyType, string> = { suv: "an SUV", pickup: "a pickup", sedan: "a sedan", hatchback: "a hatchback", van: "a van" };

const MODEL_CREDIT = "https://sketchfab.com/3d-models/20f9af9b8a404d5cb022ac6fe87f21f5";

type Mode = "still" | "ask" | "3d";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * "Shop by body type" as a showroom turntable. The still picture shows first;
 * the 3D viewer (~250 KB) only downloads when the section comes near, and on
 * Data Saver or 2G it waits for a tap. Only the selected car's model loads.
 */
export function BodyTypeShowroom({ summaries }: { summaries: BodyTypeSummary[] }) {
  const hydrated = useHydrated();
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
  const [selected, setSelected] = useState(summaries[0]?.type);
  const [mode, setMode] = useState<Mode>("still");
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLElement>(null);

  const current = summaries.find((summary) => summary.type === selected) ?? summaries[0];
  const model = current ? MODELS[current.type] : undefined;

  function start3d() {
    import("@google/model-viewer").then(() => setMode("3d"));
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const network = (navigator as Navigator & { connection?: NetworkInfo }).connection;
        if (network?.saveData || network?.effectiveType?.includes("2g")) return setMode("ask");
        // Wait until the page has finished loading and the browser is idle, so the
        // 3D never competes with the header photo or the car cards.
        const whenIdle = () =>
          "requestIdleCallback" in window ? requestIdleCallback(start3d, { timeout: 3000 }) : setTimeout(start3d, 1000);
        if (document.readyState === "complete") whenIdle();
        else window.addEventListener("load", whenIdle, { once: true });
      },
      { rootMargin: "300px" },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    // React sets `src` as a property on custom elements, so read the property.
    const onLoad = () => setLoadedSrc((viewer as HTMLElement & { src: string }).src);
    viewer.addEventListener("load", onLoad);
    return () => viewer.removeEventListener("load", onLoad);
  }, [mode]);

  if (!current) return null;
  const label = BODY_TYPE_LABELS[current.type];
  const showStill = !model || loadedSrc !== model.src;

  return (
    <section aria-labelledby="body-types-title" className="container-site section-y">
      <h2 id="body-types-title" className="section-title">
        Shop by body type
      </h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <figure className="min-w-0">
          <div ref={stageRef} className="showroom relative aspect-[3/2] overflow-hidden rounded-card">
            {model ? (
              <>
                <Image
                  src={model.poster}
                  alt={showStill ? `${label} on a showroom turntable` : ""}
                  fill
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className={`object-contain transition-opacity duration-300 ${showStill ? "opacity-100" : "opacity-0"}`}
                />
                {mode === "3d" && (
                  <model-viewer
                    ref={viewerRef}
                    src={model.src}
                    alt={`3D model of ${ARTICLE[current.type]} on a showroom turntable. Drag sideways to turn it.`}
                    camera-orbit="30deg 72deg 86%"
                    camera-controls=""
                    disable-zoom=""
                    disable-pan=""
                    disable-tap=""
                    touch-action="pan-y"
                    interaction-prompt="none"
                    shadow-intensity="1"
                    shadow-softness="0.8"
                    environment-image="neutral"
                    exposure="1.05"
                    {...(reducedMotion ? {} : { "auto-rotate": "", "auto-rotate-delay": "0", "rotation-per-second": "18deg" })}
                    className={`absolute inset-0 size-full transition-opacity duration-300 ${showStill ? "opacity-0" : "opacity-100"}`}
                  />
                )}
              </>
            ) : (
              <CarSilhouette type={current.type} className="absolute inset-x-[15%] top-1/2 h-auto w-[70%] -translate-y-1/2 text-ink-2" />
            )}

            {mode === "ask" && model && (
              <button
                type="button"
                onClick={start3d}
                className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-field border border-line bg-paper px-3 py-2 text-sm font-semibold hover:border-ink"
              >
                <Rotate3d aria-hidden size={16} />
                Rotate in 3D
              </button>
            )}
            {mode === "3d" && !showStill && (
              <p aria-hidden className="pointer-events-none absolute top-3 right-3 text-xs font-semibold text-muted">
                Drag to turn
              </p>
            )}
          </div>
          <figcaption className="mt-2 text-xs text-muted">
            3D model:{" "}
            <a href={MODEL_CREDIT} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
              Generic passenger car pack
            </a>{" "}
            by comrade1280,{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              CC BY 4.0
            </a>
            . Recoloured, with a turntable added.
          </figcaption>
        </figure>

        <div className="min-w-0">
          <div
            role="group"
            aria-label="Body type"
            // Phones: up to 3 per row, so 5 body types wrap to two readable rows; one row from tablet up.
            className="flex flex-wrap gap-1 rounded-field bg-soft p-1 sm:flex-nowrap"
          >
            {summaries.map(({ type }) => {
              const active = type === current.type;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={active}
                  disabled={!hydrated}
                  onClick={() => setSelected(type)}
                  className={`min-h-11 flex-[1_1_30%] rounded-[4px] px-2 text-sm font-semibold whitespace-nowrap transition-colors sm:flex-1 ${
                    active ? "bg-paper text-ink shadow-[0_1px_3px_rgb(14_26_43/0.15)]" : "text-muted hover:text-ink"
                  }`}
                >
                  {BODY_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>

          <div aria-live="polite" className="mt-6">
            <p className="font-wide text-2xl font-bold">{label}</p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-5xl leading-none font-extrabold text-signal tabular-nums">
                {current.count}
              </span>
              <span className="font-semibold">{current.count === 1 ? "car" : "cars"} in stock</span>
            </p>
            <p className="mt-1 text-muted">From {formatPesoShort(current.fromPrice)}</p>
          </div>

          <Link
            href={`/inventory?body=${current.type}`}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-field bg-signal px-5 font-semibold text-white transition-colors hover:bg-signal-dark"
          >
            See all {PLURAL[current.type]}
            <ArrowRight aria-hidden size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
