import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    title: "Pro monthly",
    price: "$— per month",
    note: "Best for active job searches.",
  },
  {
    title: "Pro annual",
    price: "$— per year",
    note: "Save around twenty percent (placeholder).",
  },
];

const planFeatures = [
  "Unlimited scans.",
  "Job match mode.",
  "Diff and export.",
];

export function PricingSection() {
  // #region agent log
  fetch("http://127.0.0.1:7843/ingest/b13721c5-6f30-457b-bf35-2ff1323f1da9", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "640e60",
    },
    body: JSON.stringify({
      sessionId: "640e60",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "components/landing/PricingSection.tsx:23",
      message: "Entered PricingSection component",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <section id="pricing" className="bg-bg-base">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-medium text-text-primary">
            Simple subscription pricing
          </h2>
          <p className="mt-2 text-text-secondary">
            One plan. Pick monthly or annual.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.title}
              className="border-l-2 border-[#4cc9a0] border-t-0 border-r-0 border-b-0 rounded-none bg-bg-surface p-6"
            >
              <p className="text-sm font-medium text-text-secondary">
                {plan.title}
              </p>
              <p className="mt-2 text-3xl font-medium tracking-tight text-text-primary">
                {plan.price}
              </p>
              <p className="mt-2 text-sm text-text-secondary">{plan.note}</p>

              <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                {planFeatures.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border border-border bg-bg-raised text-[10px] font-medium text-success font-mono">
                      ✓
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Button
                aria-disabled="true"
                className="mt-8 w-full hover:bg-accent/90"
              >
                Subscribe (placeholder)
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
