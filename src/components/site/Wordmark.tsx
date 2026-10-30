import Image from "next/image";
import Link from "next/link";
import logoOnDark from "@/assets/brand/invecs-logo-on-dark.png";
import logoOnLight from "@/assets/brand/invecs-logo-on-light.png";

/**
 * INVECS Autocentrum's logo, used with their permission (Oct 28, 2026).
 * "dark" tone (light backgrounds): navy letters with their red "AUTO".
 * "light" tone (dark backgrounds): their original white-and-red logo.
 */
export function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="INVECS Autocentrum home">
      <Image src={tone === "light" ? logoOnDark : logoOnLight} alt="" height={34} className="h-[34px] w-auto" />
    </Link>
  );
}
