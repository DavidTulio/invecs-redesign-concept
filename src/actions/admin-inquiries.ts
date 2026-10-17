"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { uuidSchema } from "@/lib/car-schema";
import { INQUIRY_STATUSES } from "@/lib/inquiry";
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
