import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/ComingSoon";

export const metadata: Metadata = { title: "Book a test drive" };

export default function TestDrivePage() {
  return (
    <ComingSoon title="Book a test drive" phase={3}>
      <p>
        Choose a car and a preferred date, and tell us how to reach you: call, Viber, Messenger or
        email.
      </p>
    </ComingSoon>
  );
}
