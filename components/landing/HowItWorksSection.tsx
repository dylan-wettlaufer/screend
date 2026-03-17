import { Card } from "@/components/ui/card";

const steps = [
  {
    step: "1",
    title: "Upload your resume",
    body: "PDF, DOCX, or paste plain text. Add a job description for job match mode.",
  },
  {
    step: "2",
    title: "Review scored suggestions",
    body: "Accept or dismiss improvements by severity, section, and impact on job match.",
  },
  {
    step: "3",
    title: "Preview a diff, then export",
    body: "Generate an updated resume, undo any change, then download PDF or DOCX.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="border-t border-border bg-bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-medium text-text-primary sm:text-3xl">How it works</h2>
          <p className="mt-3 text-text-secondary">
            A straightforward flow designed to keep you in control of every change.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <Card
              key={item.step}
              className="rounded-card border border-border bg-bg-raised p-6 ring-0 gap-0"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-element bg-accent text-sm font-medium text-bg-base">
                  {item.step}
                </span>
                <p className="text-sm font-medium text-text-primary">{item.title}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
