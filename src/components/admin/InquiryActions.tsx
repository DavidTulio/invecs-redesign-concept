"use client";

import { Trash2 } from "lucide-react";
import { deleteInquiry, setInquiryStatus } from "@/actions/admin-inquiries";
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUSES } from "@/lib/inquiry";
import { ConfirmButton, StatusSelect } from "./ui";

const OPTIONS = INQUIRY_STATUSES.map((value) => ({ value, label: INQUIRY_STATUS_LABELS[value] }));

export function InquiryActions({ id, status, name }: { id: string; status: string; name: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusSelect
        label={`Status of ${name}'s inquiry`}
        value={status}
        options={OPTIONS}
        onChange={(next) => setInquiryStatus(id, next)}
      />
      <ConfirmButton
        label={
          <span className="flex items-center gap-1.5 text-sm font-semibold text-signal">
            <Trash2 aria-hidden size={14} />
            Delete
          </span>
        }
        confirmLabel="Delete inquiry"
        onConfirm={() => deleteInquiry(id)}
      />
    </div>
  );
}
