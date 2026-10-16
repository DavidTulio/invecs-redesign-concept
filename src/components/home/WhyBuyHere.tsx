import { CalendarCheck, ClipboardCheck, MessageCircle, ReceiptText } from "lucide-react";

const POINTS = [
  {
    icon: ClipboardCheck,
    title: "Inspected before listing",
    body: "Engine, underchassis and papers are checked before a car goes online. The full feature list is on every car page.",
  },
  {
    icon: ReceiptText,
    title: "Clear prices, monthly estimate",
    body: "Every car shows its cash price and a monthly estimate. You can adjust the down payment and term in the loan calculator.",
  },
  {
    icon: CalendarCheck,
    title: "Test drive on your schedule",
    body: "Pick a car and a preferred date online. We confirm by your chosen contact method.",
  },
  {
    icon: MessageCircle,
    title: "Talk to a real person",
    body: "Reach us by call, Viber, Messenger or email, whichever is easiest for you.",
  },
] as const;

export function WhyBuyHere() {
  return (
    <section aria-labelledby="why-title" className="container-site py-12 sm:py-16">
      <h2 id="why-title" className="font-wide text-2xl font-bold sm:text-[28px]">
        Why buy at INVECS
      </h2>
      <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="grid content-start gap-2">
            <Icon aria-hidden size={26} strokeWidth={1.75} className="text-signal" />
            <h3 className="mt-1 text-base font-semibold">{title}</h3>
            <p className="text-[15px] leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
