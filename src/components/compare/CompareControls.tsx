"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { X } from "lucide-react";
import { compareHref } from "@/lib/compare";
import { useCompare, type CompareItem } from "@/lib/use-compare";

/** Keeps the saved list in step with the cars on the compare page. */
export function CompareSync({ items }: { items: CompareItem[] }) {
  const { replace } = useCompare();
  useEffect(() => {
    replace(items);
  }, [items, replace]);
  return null;
}

/** Removes one car from the comparison and updates the link. */
export function CompareRemove({ slug, title, slugs }: { slug: string; title: string; slugs: string[] }) {
  const router = useRouter();
  const { remove } = useCompare();
  return (
    <button
      type="button"
      onClick={() => {
        remove(slug);
        router.replace(compareHref(slugs.filter((other) => other !== slug)), { scroll: false });
      }}
      className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-muted hover:text-ink"
    >
      <X aria-hidden size={14} />
      Remove
      <span className="sr-only">{title} from the comparison</span>
    </button>
  );
}
