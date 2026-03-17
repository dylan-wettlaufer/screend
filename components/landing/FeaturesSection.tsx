import { Badge } from "@/components/ui/badge";
import { ShineBorder } from "@/components/ui/shine-border";

const scoreBars = [
  { label: "ats", score: 12, max: 20, colorClass: "bg-warning" },
  { label: "content", score: 15, max: 20, colorClass: "bg-accent" },
  { label: "writing", score: 12, max: 20, colorClass: "bg-warning" },
  { label: "job_match", score: 8, max: 20, colorClass: "bg-danger" },
  { label: "ready", score: 20, max: 20, colorClass: "bg-accent" },
];

const roleTracks = ["swe", "backend", "frontend", "devops", "data", "ml", "mobile"];

const cardBase =
  "relative overflow-hidden border-l-2 border-[#4cc9a0] border-t-0 border-r-0 border-b-0 rounded-none bg-bg-surface p-6";

export function FeaturesSection() {
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
      hypothesisId: "H2",
      location: "components/landing/FeaturesSection.tsx:16",
      message: "Entered FeaturesSection component",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <section id="features" className="bg-bg-base">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-medium text-text-primary">
            Everything you need for tech role resumes
          </h2>
          <p className="mt-2 text-text-secondary">Scan, fix, and export in minutes.</p>
        </div>
        
        {/* Row 1: large left (col-span-2) + two stacked right */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${cardBase} sm:col-span-2`}>
            <p className="text-lg font-medium text-text-primary">Five-part scoring</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Baseline ATS compatibility, writing quality, content strength, job description match, and overall readiness — each scored 0–20 with specific fixes per category.
            </p>
            <div className="mt-6 space-y-2.5">
              {scoreBars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-3">
                  <span className="w-[68px] shrink-0 text-[11px] font-mono text-text-secondary">
                    {bar.label}
                  </span>
                  <div className="flex-1 h-1.5 overflow-hidden rounded-pill bg-bg-raised">
                    <div
                      className={`h-full rounded-pill ${bar.colorClass}`}
                      style={{ width: `${(bar.score / bar.max) * 100}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[10px] font-mono text-text-tertiary">
                    {bar.score}/{bar.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stacked right column */}
          <div className="flex flex-col gap-4">
            <div className={cardBase}>
              <p className="text-sm font-medium text-text-primary">Job description matching</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Know exactly what&#39;s missing for a specific role before you apply.
              </p>
            </div>
            <div className={cardBase}>
              <p className="text-sm font-medium text-text-primary">Keyword gap analysis</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Matched vs missing keywords shown side by side.
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: two stacked left + large right (col-span-2) */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Stacked left column */}
          <div className="flex flex-col gap-4">
            <div className={cardBase}>
              <p className="text-sm font-medium text-text-primary">Accept edits line by line</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Approve or dismiss every suggestion one at a time.
              </p>
            </div>
            <div className={cardBase}>
              <p className="text-sm font-medium text-text-primary">Diff view before download</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Preview every change before you commit to the export.
              </p>
            </div>
          </div>

          {/* Large right card */}
          <div className={`${cardBase} sm:col-span-2`}>
            <p className="text-lg font-medium text-text-primary">Export to PDF or DOCX</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Download a clean, ATS-ready file the moment you&#39;re done reviewing. No formatting surprises, no layout drift.
            </p>
            <div className="mt-6 space-y-1.5 rounded-element bg-bg-raised px-4 py-3 font-mono text-xs">
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 text-danger">−</span>
                <span className="text-danger line-through opacity-70">
                  Developed scalable backend services using Node.js
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 text-accent">+</span>
                <span className="text-accent">
                  Built and scaled Node.js microservices handling 50k req/s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width role tracks card */}
        <div className={`mt-10 ${cardBase}`}>
          <p className="text-sm font-medium text-text-primary">Role tracks</p>
          <p className="mt-1 text-sm text-text-secondary">Tune feedback for your target role.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {roleTracks.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-pill border-border px-3 py-1 font-mono text-sm text-text-secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
