import { Card } from "@/components/ui/card";

const faqs = [
  {
    q: "Will Screend rewrite my entire resume?",
    a: "No. The core flow is line-level suggestions that you can accept or dismiss, then a rewrite that only applies accepted items.",
  },
  {
    q: "Is there a free tier?",
    a: "Not in version one. Screend is designed as a subscription product from day one and the landing page should clearly justify the value before the call to action.",
  },
];

export function FaqSection() {
  return (
    <section className="border-t border-border bg-bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-medium text-text-primary sm:text-3xl">FAQ</h2>
          <p className="mt-3 text-text-secondary">Quick answers.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <Card
              key={item.q}
              className="rounded-card border border-border bg-bg-raised p-6 ring-0 gap-0"
            >
              <p className="text-sm font-medium text-text-primary">{item.q}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{item.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
