import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { ShineBorder } from "@/components/ui/shine-border";
import { NumberTicker } from "@/components/ui/number-ticker";
import {GridPattern} from "@/components/ui/grid-pattern";

const scoreBars = [
  { label: "ATS", score: 12, max: 20, colorClass: "bg-warning" },
  { label: "Content", score: 15, max: 20, colorClass: "bg-accent" },
  { label: "Writing", score: 12, max: 20, colorClass: "bg-warning" },
  { label: "Job Match", score: 8, max: 20, colorClass: "bg-danger" },
  { label: "Ready", score: 20, max: 20, colorClass: "bg-accent" },
];

const roleTracks = ["swe", "backend", "frontend", "devops", "data", "ml", "mobile"];

export function HeroSection() {
  return (
    <section className="bg-bg-base">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
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

          {/* Headline */}
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

          {/* UI Preview Card */}
          <div className="relative mt-10 overflow-hidden rounded-card border border-border bg-bg-surface p-5 text-left">
            <ShineBorder shineColor={["#4cc9a0", "#a7edce"]} borderWidth={1} duration={20} />
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] text-text-tertiary uppercase tracking-widest">sample scan</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              {/* Score ring */}
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#2a3230"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#f5cb4c"
                      strokeWidth="2.5"
                      strokeDasharray="63 31"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <NumberTicker
                      value={67}
                      className="text-xl font-medium  text-text-primary tracking-normal"
                    />
                    <span className="text-[9px] text-text-tertiary">/100</span>
                  </div>
                </div>
                <p className="text-[10px] text-text-tertiary">overall</p>
              </div>

              {/* Score bars */}
              <div className="flex-1 space-y-2.5">
                {scoreBars.map((bar) => (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="w-[68px] shrink-0 text-[11px] text-text-secondary">
                      {bar.label}
                    </span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-pill bg-bg-raised">
                      <div
                        className={`h-full rounded-pill ${bar.colorClass}`}
                        style={{ width: `${(bar.score / bar.max) * 100}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-[10px] text-text-tertiary">
                      {bar.score}/{bar.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role compatibility strip */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-text-tertiary">Tuned for multiple role tracks</p>
            <div className="flex flex-wrap justify-center gap-2">
              {roleTracks.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-pill border-border text-text-secondary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
