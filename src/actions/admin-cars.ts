"use server";

import { randomUUID } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "@/lib/zod";
import { CAR_STATUSES, FEATURED_MAX, makeCarSchema, PHOTO_MAX_BYTES, sniffImageType, uuidSchema } from "@/lib/car-schema";
import { CARS_TAG } from "@/lib/data/cars";
import { requireAdmin } from "@/lib/server/auth";
import { OFFICIAL_CONTACT, SITE_NAME } from "@/lib/site";
import { carSlug } from "@/lib/slug";
import { carTitle } from "@/lib/types";

// Every action here re-checks the admin on the server (requireAdmin) and runs as the
// admin's own session, so the database's Row Level Security applies as well.

const BUCKET = "car-photos";
const FIELDS = [
  "make", "model", "variant", "year", "body_type", "transmission", "fuel",
  "mileage_km", "price_php", "color", "description", "features", "status", "featured",
] as const;

export type CarFormState = {
  status: "idle" | "saved" | "error";
  message?: string;
  errors?: Partial<Record<(typeof FIELDS)[number], string>>;
  values?: Record<string, string>;
};

/** Cars changed: refresh the public pages' cached data and this admin page. */
function carsChanged() {
  updateTag(CARS_TAG);
  refresh();
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], base: string) {
  const { data } = await supabase.from("cars").select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((row) => row.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export async function saveCar(_previous: CarFormState, formData: FormData): Promise<CarFormState> {
  const { supabase } = await requireAdmin();

  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "")]));
  const parsed = makeCarSchema().safeParse(values);
  if (!parsed.success) {
    const errors: CarFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<CarFormState["errors"]>;
      errors[field] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", errors, values };
  }

  // A sold car can't stay featured; otherwise keep to FEATURED_MAX featured cars.
  const car = { ...parsed.data, featured: parsed.data.featured && parsed.data.status !== "sold" };
  const rawId = formData.get("id");
  const id = rawId ? uuidSchema.safeParse(rawId) : null;
  if (id && !id.success) return { status: "error", message: "Unknown car.", values };

  if (car.featured) {
    let others = supabase.from("cars").select("id", { count: "exact", head: true }).eq("featured", true).neq("status", "sold");
    if (id) others = others.neq("id", id.data);
    const { count, error } = await others;
    if (error) return { status: "error", message: "Couldn't save the car. Please try again.", values };
    if ((count ?? 0) >= FEATURED_MAX) {
      return {
        status: "error",
        message: "Please check the highlighted fields.",
        errors: { featured: `You can feature up to ${FEATURED_MAX} cars. Remove one first.` },
        values,
      };
    }
  }

  if (id) {
    // Editing. The link (slug) stays the same so shared links keep working.
    const { error } = await supabase.from("cars").update(car).eq("id", id.data);
    if (error) {
      console.error("Updating car failed:", error.message);
      return { status: "error", message: "Couldn't save the car. Please try again.", values };
    }
    carsChanged();
    return { status: "saved", message: "Changes saved. The public site is updated." };
  }

  const slug = await uniqueSlug(supabase, carSlug(car));
  const { data: created, error } = await supabase
    .from("cars")
    .insert({ ...car, slug })
    .select("id")
    .single();
  if (error || !created) {
    console.error("Creating car failed:", error?.message);
    return { status: "error", message: "Couldn't add the car. Please try again.", values };
  }
  updateTag(CARS_TAG);
  redirect(`/admin/cars/${created.id}?created=1`);
}

export async function setCarStatus(carId: string, status: string) {
  const { supabase } = await requireAdmin();
  const id = uuidSchema.parse(carId);
  const next = z.enum(CAR_STATUSES).parse(status);
  // Marking a car sold also takes it off the home page's featured spots.
  const { error } = await supabase
    .from("cars")
    .update(next === "sold" ? { status: next, featured: false } : { status: next })
    .eq("id", id);
  if (error) throw new Error("Couldn't change the status.");
  carsChanged();
}

export async function deleteCar(carId: string) {
  const { supabase } = await requireAdmin();
  const id = uuidSchema.parse(carId);

  // Remove the photo files first; the photo rows are removed with the car.
  const { data: photos } = await supabase.from("car_photos").select("path").eq("car_id", id);
  if (photos?.length) await supabase.storage.from(BUCKET).remove(photos.map((p) => p.path));

  const { error } = await supabase.from("cars").delete().eq("id", id);
  if (error) throw new Error("Couldn't delete the car.");
  updateTag(CARS_TAG);
  redirect("/admin/cars?deleted=1");
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export type UploadResult = { ok: true } | { ok: false; error: string };

/** Uploads one photo. The browser sends files one at a time to stay under the size limit. */
export async function uploadPhoto(carId: string, formData: FormData): Promise<UploadResult> {
  const { supabase } = await requireAdmin();
  const id = uuidSchema.safeParse(carId);
  if (!id.success) return { ok: false, error: "Unknown car." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo to upload." };
  if (file.size > PHOTO_MAX_BYTES) return { ok: false, error: `${file.name} is larger than 5 MB.` };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, error: `${file.name} isn't a JPG, PNG or WebP image.` };

  const { data: car } = await supabase.from("cars").select("slug, year, make, model, variant").eq("id", id.data).single();
  if (!car) return { ok: false, error: "Unknown car." };

  // A random file name: nothing from the visitor's file name reaches storage.
  const path = `cars/${car.slug}/${randomUUID()}.${type.ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: type.mime, upsert: false });
  if (uploadError) {
    console.error("Photo upload failed:", uploadError.message);
    return { ok: false, error: `Couldn't upload ${file.name}.` };
  }

  const { data: last } = await supabase
    .from("car_photos")
    .select("position")
    .eq("car_id", id.data)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? -1) + 1;
  const { error: rowError } = await supabase.from("car_photos").insert({
    car_id: id.data,
    path,
    position,
    // Numbered, so a screen reader doesn't hear the same sentence for every photo.
    alt: `${carTitle(car)} ${car.variant}`.trim() + `, photo ${position + 1}`,
    // The dealer's own photos, shown with permission: the gallery credits them.
    credit_name: SITE_NAME,
    credit_url: OFFICIAL_CONTACT.facebook,
  });
  if (rowError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, error: `Couldn't save ${file.name}.` };
  }

  carsChanged();
  return { ok: true };
}

async function renumber(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], carId: string, orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((photoId, position) =>
      supabase.from("car_photos").update({ position }).eq("id", photoId).eq("car_id", carId),
    ),
  );
}

async function photosOf(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], photoId: string) {
  const id = uuidSchema.parse(photoId);
  const { data: photo } = await supabase.from("car_photos").select("id, car_id, path").eq("id", id).single();
  if (!photo) throw new Error("Unknown photo.");
  const { data: all } = await supabase
    .from("car_photos")
    .select("id")
    .eq("car_id", photo.car_id)
    .order("position");
  return { photo, ids: (all ?? []).map((p) => p.id) };
}

export async function movePhoto(photoId: string, direction: "up" | "down" | "first") {
  const { supabase } = await requireAdmin();
  const { photo, ids } = await photosOf(supabase, photoId);
  const index = ids.indexOf(photo.id);
  const next = [...ids];
  next.splice(index, 1);
  const target = direction === "first" ? 0 : direction === "up" ? Math.max(0, index - 1) : Math.min(ids.length - 1, index + 1);
  next.splice(target, 0, photo.id);
  await renumber(supabase, photo.car_id, next);
  carsChanged();
}

export async function deletePhoto(photoId: string) {
  const { supabase } = await requireAdmin();
  const { photo, ids } = await photosOf(supabase, photoId);
  await supabase.storage.from(BUCKET).remove([photo.path]);
  const { error } = await supabase.from("car_photos").delete().eq("id", photo.id);
  if (error) throw new Error("Couldn't delete the photo.");
  await renumber(supabase, photo.car_id, ids.filter((id) => id !== photo.id));
  carsChanged();
}

export async function updatePhotoAlt(photoId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuidSchema.parse(photoId);
  const alt = z.string().trim().min(1).max(200).parse(formData.get("alt"));
  const { error } = await supabase.from("car_photos").update({ alt }).eq("id", id);
  if (error) throw new Error("Couldn't save the description.");
  carsChanged();
}
