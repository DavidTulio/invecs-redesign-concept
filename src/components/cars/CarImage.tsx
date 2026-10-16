import Image from "next/image";
import { carPhotoUrl } from "@/lib/supabase/public";
import type { BodyType, CarPhoto } from "@/lib/types";
import { CarSilhouette } from "./CarSilhouette";

/**
 * A car photo that fills its (positioned, sized) parent.
 * next/image serves a resized WebP/AVIF for the visitor's screen and lazy-loads it,
 * which matters on mobile data. Falls back to a silhouette when a car has no photo yet.
 */
export function CarImage({
  photo,
  bodyType,
  sizes,
  preload = false,
}: {
  photo: CarPhoto | undefined;
  bodyType: BodyType;
  sizes: string;
  preload?: boolean;
}) {
  if (!photo) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-[#e9edf2] to-[#d9dfe7] text-[#b3bdca]">
        <CarSilhouette type={bodyType} className="w-3/5" />
        <span className="sr-only">No photo yet</span>
      </div>
    );
  }

  return (
    <Image
      src={carPhotoUrl(photo.path)}
      alt={photo.alt}
      fill
      sizes={sizes}
      preload={preload}
      className="object-cover"
    />
  );
}
