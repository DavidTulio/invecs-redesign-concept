import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CarForm } from "@/components/admin/CarForm";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Add a car" };

/**
 * Returns at once with a placeholder; the content below checks the login and loads
 * data on the server, then streams in. Keeps moving between admin pages instant.
 */
export default function NewCarPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewCarContent />
    </Suspense>
  );
}

async function NewCarContent() {
  await requireAdmin();

  return (
    <div className="grid max-w-4xl gap-6">
      <Link href="/admin/cars" className="flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft aria-hidden size={16} />
        All cars
      </Link>
      <div>
        <h1 className="font-wide text-3xl font-extrabold">Add a car</h1>
        <p className="mt-1 text-sm text-muted">You can add photos after saving.</p>
      </div>
      <div className="rounded-card border border-line bg-paper p-5 sm:p-6">
        <CarForm
          initial={{
            make: "",
            model: "",
            variant: "",
            year: "",
            body_type: "suv",
            transmission: "automatic",
            fuel: "diesel",
            mileage_km: "",
            price_php: "",
            color: "",
            description: "",
            features: "",
            status: "available",
          }}
        />
      </div>
    </div>
  );
}
