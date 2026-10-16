// Seeds Supabase with the sample cars and their photos.
// Run: npm run db:seed
//
// Uses the SECRET key, which bypasses Row Level Security, so it only ever runs
// on your own computer. Safe to run again: it replaces the sample data.

import { createClient } from "@supabase/supabase-js";
import { carSlug } from "../src/lib/slug.ts";
import { seedCars } from "./seed-data.ts";

const BUCKET = "car-photos";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, secretKey, { auth: { persistSession: false } });

function fail(step: string, error: { message: string } | null) {
  if (!error) return;
  console.error(`✗ ${step}: ${error.message}`);
  process.exit(1);
}

async function downloadPhoto(imageId: string) {
  // Unsplash's image CDN resizes and converts for us: 1600px wide WebP, well under 5MB.
  const response = await fetch(
    `https://images.unsplash.com/photo-${imageId}?w=1600&q=80&fm=webp&fit=max`,
  );
  if (!response.ok) throw new Error(`Download failed for ${imageId}: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function main() {
  const now = Date.now();
  const slugs = seedCars.map(carSlug);

  // 1. Remove cars that are no longer in the seed list (photos rows cascade).
  const { data: existing, error: listError } = await supabase.from("cars").select("id, slug");
  fail("Reading cars (did you run the migration SQL?)", listError);
  const stale = (existing ?? []).filter((car) => !slugs.includes(car.slug));
  if (stale.length) {
    const { error } = await supabase.from("cars").delete().in("id", stale.map((car) => car.id));
    fail("Removing old cars", error);
  }

  for (const [index, seed] of seedCars.entries()) {
    const slug = slugs[index];
    const { photos, listedDaysAgo, ...fields } = seed;
    const createdAt = new Date(now - listedDaysAgo * 86_400_000).toISOString();

    // 2. Insert or update the car, matched by slug.
    const { data: car, error: carError } = await supabase
      .from("cars")
      .upsert({ ...fields, slug, created_at: createdAt }, { onConflict: "slug" })
      .select("id")
      .single();
    fail(`Saving ${slug}`, carError);

    // 3. Replace its photos: storage files first, then rows.
    const { data: oldFiles } = await supabase.storage.from(BUCKET).list(`cars/${slug}`);
    if (oldFiles?.length) {
      await supabase.storage.from(BUCKET).remove(oldFiles.map((file) => `cars/${slug}/${file.name}`));
    }
    await supabase.from("car_photos").delete().eq("car_id", car!.id);

    const rows = [];
    for (const [position, photo] of photos.entries()) {
      const path = `cars/${slug}/${position + 1}-${photo.imageId.slice(0, 13)}.webp`;
      const bytes = await downloadPhoto(photo.imageId);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType: "image/webp", upsert: true });
      fail(`Uploading ${path}`, uploadError);

      rows.push({
        car_id: car!.id,
        path,
        position,
        alt: photo.alt,
        credit_name: photo.photographer,
        credit_url: `https://unsplash.com/photos/${photo.pageId}`,
      });
    }
    const { error: photoError } = await supabase.from("car_photos").insert(rows);
    fail(`Saving photos for ${slug}`, photoError);

    console.log(`✓ ${slug} (${photos.length} photo${photos.length === 1 ? "" : "s"})`);
  }

  console.log(`\nDone: ${seedCars.length} cars seeded.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
