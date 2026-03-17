import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg-base/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-element bg-accent text-sm font-medium text-bg-base">
              S
            </span>
            <span className="text-base font-medium text-text-primary">Screend</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-text-secondary md:flex">
            <a href="#features" className="transition-colors hover:text-accent">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-accent">
              How it works
            </a>
            <a href="#pricing" className="transition-colors hover:text-accent">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden border-border bg-bg-surface text-text-primary hover:bg-bg-hover hover:text-text-primary sm:inline-flex"
            >
              Sign in
            </Button>
            <Button
              size="sm"
              aria-disabled="true"
              className="hover:bg-accent/90"
            >
              Go to dashboard
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center rounded-pill border border-accent-dim bg-accent-muted px-3 py-1 text-xs font-medium text-accent">
                Built for tech job seekers • ATS-aware • Line-level control
              </p>
              <h1 className="mt-6 text-4xl font-medium leading-tight text-accent sm:text-5xl">
                Make your resume match the role without losing your voice
              </h1>
              <p className="mt-5 text-lg leading-8 text-text-secondary">
                Screend scans your resume (and optional job description), scores it across five
                dimensions, and suggests targeted improvements you can accept one line at a time,
                then preview a diff and export a clean PDF or DOCX.
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
                {[
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
                ].map((item) => (
                  <Card
                    key={item.title}
                    className="rounded-card border border-border bg-bg-surface p-4 ring-0 gap-0"
                  >
                    <p className="text-sm font-medium text-accent">{item.title}</p>
                    <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
                  </Card>
                ))}
              </div>

              <p className="mt-6 text-xs text-text-tertiary">
                Prototype landing page. Buttons are placeholders; dashboard routing will be added
                later.
              </p>
            </div>
          </div>
        </section>

        {/* ── Social proof strip ─────────────────────────────── */}
        <section className="border-y border-accent-dim bg-bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <p className="text-sm text-text-secondary">
                Social proof goes here (testimonials, logos, or usage stats) once you have real
                data.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["ATS-friendly", "Tech keyword focus", "Line-level edits", "Export PDF or DOCX"].map(
                  (pill) => (
                    <Badge
                      key={pill}
                      className="rounded-pill border-accent-dim bg-accent-muted px-3 py-1 font-mono text-accent"
                    >
                      {pill}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-medium text-accent sm:text-3xl">
              Everything you need for tech role resumes
            </h2>
            <p className="mt-3 text-text-secondary">
              Generic resume tools miss engineering nuance. Screend is tuned for how tech recruiters
              and ATS systems read projects, impact, and keyword coverage.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Five-part scoring 0–100",
                body: "ATS, content, writing, job match, and ready so you know what to fix first.",
              },
              {
                title: "Job description matching",
                body: "Paste a job description to see alignment and the most meaningful gaps for that role.",
              },
              {
                title: "Keyword gap analysis",
                body: "See matched versus missing keywords and jump to suggestions tied to gaps.",
              },
              {
                title: "Accept edits line by line",
                body: "You stay in control and accept or dismiss each suggestion instead of a full rewrite.",
              },
              {
                title: "Diff view before download",
                body: "Preview original versus revised side by side and undo individual changes.",
              },
              {
                title: "Export to PDF or DOCX",
                body: "Download a clean, single column resume output with accepted changes applied.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="rounded-card border border-border bg-bg-surface p-6 ring-0 gap-0"
              >
                <p className="text-sm font-medium text-accent">{feature.title}</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{feature.body}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-10 rounded-card border border-border bg-bg-surface p-6 ring-0 gap-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Role tracks (optional)</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Tune feedback for SWE, backend, frontend, full stack, data, devops and platform,
                  ML, mobile, or general tech.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["SWE", "Backend", "Frontend", "Devops", "Data", "ML", "Mobile"].map((tag) => (
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
          </Card>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section id="how" className="border-t border-border bg-bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-medium text-accent sm:text-3xl">How it works</h2>
              <p className="mt-3 text-text-secondary">
                A straightforward flow designed to keep you in control of every change.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
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
              ].map((item) => (
                <Card
                  key={item.step}
                  className="rounded-card border border-border bg-bg-raised p-6 ring-0 gap-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-element bg-accent text-sm font-medium text-bg-base">
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

        {/* ── Pricing ────────────────────────────────────────── */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-medium text-accent sm:text-3xl">
              Simple subscription pricing
            </h2>
            <p className="mt-3 text-text-secondary">
              Version one is subscription only with no free tier. The goal is to deliver
              consistently high signal feedback for tech roles.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[
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
            ].map((plan) => (
              <Card
                key={plan.title}
                className="rounded-card border border-border bg-bg-surface p-6 ring-0 gap-0"
              >
                <p className="text-sm font-medium text-text-primary">{plan.title}</p>
                <p className="mt-2 text-3xl font-medium tracking-tight text-text-primary">
                  {plan.price}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{plan.note}</p>
                <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                  {[
                    "Unlimited scans.",
                    "General and job match modes.",
                    "Keyword gap analysis in job match.",
                    "Line-level accept or reject with diff.",
                    "PDF and DOCX export.",
                    "Scan history.",
                  ].map((line) => (
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
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="border-t border-border bg-bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-medium text-accent sm:text-3xl">FAQ</h2>
              <p className="mt-3 text-text-secondary">
                A few common questions you will likely get from early users.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  q: "Will Screend rewrite my entire resume?",
                  a: "No. The core flow is line-level suggestions that you can accept or dismiss, then a rewrite that only applies accepted items.",
                },
                {
                  q: "What file formats are supported?",
                  a: "PDF and DOCX uploads plus a plain text paste option. If a PDF is scanned and cannot be parsed, you are prompted to paste text.",
                },
                {
                  q: "Is there a free tier?",
                  a: "Not in version one. Screend is designed as a subscription product from day one and the landing page should clearly justify the value before the call to action.",
                },
                {
                  q: "Can I tailor feedback for specific tech roles?",
                  a: "Yes. You can optionally select a role track such as SWE, backend, devops, or ML to bias feedback toward that track's norms.",
                },
              ].map((item) => (
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
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-bg-base">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-element bg-accent text-sm font-medium text-bg-base">
                S
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">Screend</p>
                <p className="text-xs text-text-tertiary">AI resume scans for tech jobs</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
              <a className="transition-colors hover:text-accent" href="#features">
                Features
              </a>
              <a className="transition-colors hover:text-accent" href="#how">
                How it works
              </a>
              <a className="transition-colors hover:text-accent" href="#pricing">
                Pricing
              </a>
              <a className="transition-colors hover:text-accent" href="#">
                Privacy
              </a>
            </div>
          </div>

          <p className="mt-8 text-xs text-text-tertiary">
            © {new Date().getFullYear()} Screend. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
