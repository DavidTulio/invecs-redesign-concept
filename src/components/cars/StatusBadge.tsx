import type { CarStatus } from "@/lib/types";

const STYLES: Record<CarStatus, string> = {
  available: "bg-[#e6f4ed] text-ok",
  reserved: "bg-[#fff3d6] text-warn",
  sold: "bg-ink text-white",
};

const LABELS: Record<CarStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export function StatusBadge({ status, className = "" }: { status: CarStatus; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${STYLES[status]} ${className}`}
    >
      {LABELS[status]}
    </span>
  );
}
