import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export const BRANCHES_TAG = "branches";

export type Branch = {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  viber_phone: string | null;
  email: string | null;
  map_url: string | null;
  messenger_url: string | null;
};

export async function getBranches(): Promise<Branch[]> {
  "use cache";
  cacheLife("days");
  cacheTag(BRANCHES_TAG);

  const { data, error } = await createPublicClient()
    .from("branches")
    .select("id, name, address, hours, phone, viber_phone, email, map_url, messenger_url")
    .order("position");

  if (error) throw new Error(`Could not load branches: ${error.message}`);
  return data as Branch[];
}
