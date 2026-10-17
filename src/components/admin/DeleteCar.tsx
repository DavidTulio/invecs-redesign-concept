"use client";

import { Trash2 } from "lucide-react";
import { deleteCar } from "@/actions/admin-cars";
import { ConfirmButton } from "./ui";

export function DeleteCar({ carId, title }: { carId: string; title: string }) {
  return (
    <section aria-labelledby="danger-title" className="rounded-card border border-signal/30 bg-paper p-5">
      <h2 id="danger-title" className="font-semibold">
        Delete this car
      </h2>
      <p className="mt-1 text-sm text-muted">
        Removes the {title}, its photos and its page for good. To take it off sale but keep the record, set the
        status to Sold instead.
      </p>
      <div className="mt-4">
        <ConfirmButton
          label={
            <span className="flex items-center gap-2 rounded-field border border-signal/40 px-4 py-2 text-sm font-semibold text-signal hover:bg-[#fdecef]">
              <Trash2 aria-hidden size={16} />
              Delete car
            </span>
          }
          confirmLabel={`Yes, delete the ${title}`}
          onConfirm={() => deleteCar(carId)}
        />
      </div>
    </section>
  );
}
