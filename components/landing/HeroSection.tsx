import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GridPattern } from "@/components/ui/grid-pattern";
import { TypingAnimation } from "@/components/ui/typing-animation";

const highlights = [
  {
    title: "General scan",
    body: "Baseline ATS, writing, and content quality for tech resumes.",
  },
  {
    title: "Job match scan",
    body: "Keyword gaps and alignment to a specific role and job description.",
  },
  {
    title: "Diff and export",
    body: "Review changes side by side, then download PDF or DOCX.",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="stroke-accent/30 fill-accent/3 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,white,transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center rounded-element border border-accent-dim bg-accent-muted px-3 py-1 text-xs font-medium text-accent">
            Built for tech job seekers • ATS-aware • Line-level control
          </p>

          <TypingAnimation
            as="h1"
            duration={45}
            className="mt-6 text-5lg font-medium leading-tight tracking-normal text-text-primary sm:text-5xl"
          >
            Make your resume match the role without losing your voice
          </TypingAnimation>

          <p className="mt-5 text-xl leading-8 text-text-secondary">
          Built for engineers who want control over every change.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              aria-disabled="true"
              className="w-full px-6 py-2.5 hover:bg-accent/90 sm:w-auto"
            >
              Go to dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full border-border bg-bg-surface px-6 py-2.5 text-text-primary hover:bg-bg-hover hover:text-text-primary sm:w-auto"
            >
              <a href="#how">See how it works</a>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            {highlights.map((item) => (
              <Card
                key={item.title}
                className="rounded-card border border-border bg-bg-surface p-4 ring-0 gap-0"
              >
                <p className="text-sm font-medium text-text-primary">{item.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
              </Card>
            ))}
          </div>

          <p className="mt-6 text-xs text-text-tertiary">
            Prototype landing page.
          </p>
        </div>
      </div>
    </section>
  );
}
