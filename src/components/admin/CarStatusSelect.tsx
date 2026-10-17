"use client";

import { setCarStatus } from "@/actions/admin-cars";
import { StatusSelect } from "./ui";

const OPTIONS = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
] as const;

export function CarStatusSelect({ carId, status, title }: { carId: string; status: string; title: string }) {
  return (
    <StatusSelect
      label={`Status of the ${title}`}
      value={status}
      options={OPTIONS}
      onChange={(next) => setCarStatus(carId, next)}
    />
  );
}
