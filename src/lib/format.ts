const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-PH");

/** ₱1,100,000 */
export function formatPeso(amount: number) {
  return peso.format(amount);
}

/** ₱1.1M or ₱790K, for tight spaces like "from" labels. */
export function formatPesoShort(amount: number) {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `₱${Number.isInteger(millions) ? millions : millions.toFixed(2).replace(/0$/, "")}M`;
  }
  return `₱${Math.round(amount / 1000)}K`;
}

/** 48,000 km */
export function formatKm(km: number) {
  return `${number.format(km)} km`;
}
