/** "2021 Toyota Fortuner 2.8 V 4x4" → "2021-toyota-fortuner-2-8-v-4x4" */
export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function carSlug(car: { year: number; make: string; model: string; variant: string }) {
  return slugify(`${car.year} ${car.make} ${car.model} ${car.variant}`);
}
