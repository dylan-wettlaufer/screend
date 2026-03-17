import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const roleTracks = ["SWE", "Backend", "Frontend", "Devops", "Data", "ML", "Mobile", "Full Stack", "UI/UX"];

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

          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 rounded-element border border-border bg-bg-surface px-3 py-1.5 text-xs text-text-secondary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-pill bg-accent" />
            </span>
            <span className="font-medium text-accent">New</span>
            <span className="text-border-strong">|</span>
            <span>AI resume scans for tech roles</span>
          </div>

          {/* Two-line split headline */}
          <h1 className="mt-6 text-4xl font-medium leading-tight text-text-primary sm:text-5xl">
            Make your resume match the role
            <br />
            <TypingAnimation
              as="span"
              duration={45}
              className="text-accent tracking-normal"
            >
              without losing your voice.
            </TypingAnimation>
          </h1>

          {/* Subtext */}
          <p className="mt-5 text-xl leading-9 text-text-primary">
          Built for engineers who want control over every change.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              aria-disabled="true"
              className="w-full px-6 py-2.5 hover:bg-accent/90 sm:w-auto cursor-pointer"
            >
              Join waitlist
            </Button>
            <Button
              variant="outline"
              className="w-full border-border bg-bg-surface px-6 py-2.5 text-text-primary hover:bg-bg-hover hover:text-text-primary sm:w-auto cursor-pointer"
            >
              <a href="#how">See how it works</a>
            </Button>
          </div>

          {/* Role compatibility strip */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-text-tertiary">Tuned for multiple role tracks</p>
            <div className="flex flex-wrap justify-center gap-2">
              {roleTracks.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-pill border-border font-mono text-text-secondary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Mini-cards */}
          <div className="mt-12 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
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

        </div>
      </div>
    </section>
  );
}
