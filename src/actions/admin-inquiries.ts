"use server";

import { refresh } from "next/cache";
import { z } from "@/lib/zod";
import { uuidSchema } from "@/lib/car-schema";
import { INQUIRY_STATUSES, STAFF_NOTES_MAX } from "@/lib/inquiry";
import { requireAdmin } from "@/lib/server/auth";

export async function setInquiryStatus(inquiryId: string, status: string) {
  const { supabase } = await requireAdmin();
  const id = uuidSchema.parse(inquiryId);
  const next = z.enum(INQUIRY_STATUSES).parse(status);
  const { error } = await supabase.from("inquiries").update({ status: next }).eq("id", id);
  if (error) throw new Error("Couldn't change the status.");
  refresh();
}

export async function deleteInquiry(inquiryId: string) {
  const { supabase } = await requireAdmin();
  const id = uuidSchema.parse(inquiryId);
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw new Error("Couldn't delete the inquiry.");
  refresh();
}


/** Private notes for staff ("Called 10/28, prefers Saturday"). Admins only, like every action here. */
export async function saveStaffNotes(inquiryId: string, notes: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireAdmin();
  const id = uuidSchema.parse(inquiryId);
  const parsed = z.string().trim().max(STAFF_NOTES_MAX).safeParse(notes);
  if (!parsed.success) return { ok: false, error: `Keep notes under ${STAFF_NOTES_MAX} characters.` };
  const { error } = await supabase.from("inquiries").update({ staff_notes: parsed.data }).eq("id", id);
  if (error) return { ok: false, error: "Couldn't save the notes. Please try again." };
  return { ok: true };
}
