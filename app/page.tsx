export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-black">
              S
            </span>
            <span className="text-base font-semibold tracking-tight">Screend</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-zinc-700 dark:text-zinc-300 md:flex">
            <a href="#features" className="hover:text-zinc-950 dark:hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-zinc-950 dark:hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="hover:text-zinc-950 dark:hover:text-white">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:focus-visible:ring-white/20 sm:inline-flex"
            >
              Sign in
            </button>
            <button
              type="button"
              aria-disabled="true"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-zinc-950/10 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:bg-white dark:text-black dark:ring-white/10 dark:hover:bg-zinc-200 dark:focus-visible:ring-white/20"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-200 via-sky-200 to-indigo-200 blur-3xl opacity-50 dark:from-emerald-500/20 dark:via-sky-500/20 dark:to-indigo-500/20" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                Built for tech job seekers • ATS-aware • Line-level control
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
                Make your resume{" "}
                <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
                  match the role
                </span>{" "}
                without losing your voice.
              </h1>
              <p className="mt-5 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
                Screend scans your resume (and optional job description), scores it across five dimensions, and
                suggests targeted improvements you can accept one line at a time—then preview a diff and export
                a clean PDF or DOCX.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  aria-disabled="true"
                  className="inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-zinc-950/10 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:bg-white dark:text-black dark:ring-white/10 dark:hover:bg-zinc-200 dark:focus-visible:ring-white/20 sm:w-auto"
                >
                  Go to dashboard
                </button>
                <a
                  href="#how"
                  className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:focus-visible:ring-white/20 sm:w-auto"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
                {[
                  {
                    title: "General scan",
                    body: "Baseline ATS + writing + content quality for tech resumes.",
                  },
                  {
                    title: "Job match scan",
                    body: "Keyword gaps and alignment to a specific role & JD.",
                  },
                  {
                    title: "Diff + export",
                    body: "Review changes side-by-side, then download PDF/DOCX.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{item.body}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
                Prototype landing page. Buttons are placeholders; dashboard routing will be added later.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200/70 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Social proof goes here (testimonials, logos, or usage stats) once you have real data.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["ATS-friendly", "Tech keyword focus", "Line-level edits", "Export PDF/DOCX"].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-black/40 dark:text-zinc-300"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need for tech-role resumes
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              Generic resume tools miss engineering nuance. Screend is tuned for how tech recruiters and ATS systems
              read projects, impact, and keyword coverage.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Five-part scoring (0–100)",
                body: "ATS, Content, Writing, Job Match, and Ready—so you know what to fix first.",
              },
              {
                title: "Job description matching",
                body: "Paste a JD to see alignment and the most meaningful gaps for that role.",
              },
              {
                title: "Keyword gap analysis",
                body: "See matched vs missing keywords and jump to suggestions tied to gaps.",
              },
              {
                title: "Accept edits line-by-line",
                body: "You stay in control: accept or dismiss each suggestion instead of a full rewrite.",
              },
              {
                title: "Diff view before download",
                body: "Preview original vs revised side-by-side and undo individual changes.",
              },
              {
                title: "Export to PDF or DOCX",
                body: "Download a clean, single-column resume output with accepted changes applied.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{feature.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">Role tracks (optional)</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Tune feedback for SWE, Backend, Frontend, Full Stack, Data, DevOps/Platform, ML, Mobile, or General Tech.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["SWE", "Backend", "Frontend", "DevOps", "Data", "ML", "Mobile"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-black/40 dark:text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-zinc-200/70 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
              <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                A straightforward flow designed to keep you in control of every change.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Upload your resume",
                  body: "PDF, DOCX, or paste plain text. Add a job description for Job Match mode.",
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
                <div
                  key={item.step}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-white/10 dark:bg-black/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-black">
                      {item.step}
                    </span>
                    <p className="text-sm font-semibold">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Simple subscription pricing</h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              V1 is subscription-only (no free tier). The goal is to deliver consistently high-signal feedback for tech roles.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[
              {
                title: "Pro Monthly",
                price: "$— / month",
                note: "Best for active job searches",
              },
              {
                title: "Pro Annual",
                price: "$— / year",
                note: "Save ~20% (placeholder)",
              },
            ].map((plan) => (
              <div
                key={plan.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-sm font-semibold">{plan.title}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{plan.price}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{plan.note}</p>
                <ul className="mt-6 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {[
                    "Unlimited scans",
                    "General + Job Match modes",
                    "Keyword gap analysis (Job Match)",
                    "Line-level accept/reject + diff",
                    "PDF + DOCX export",
                    "Scan history",
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[10px] font-semibold text-zinc-700 dark:border-white/10 dark:bg-black/40 dark:text-zinc-200">
                        ✓
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <button
                    type="button"
                    aria-disabled="true"
                    className="inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-white/20"
                  >
                    Subscribe (placeholder)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-200/70 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">FAQ</h2>
              <p className="mt-3 text-zinc-700 dark:text-zinc-300">
                A few common questions you’ll likely get from early users.
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
                  a: "PDF and DOCX uploads (plus a plain-text paste option). If a PDF is scanned and can’t be parsed, you’ll be prompted to paste text.",
                },
                {
                  q: "Is there a free tier?",
                  a: "Not in V1. Screend is designed as a subscription product from day one; the landing page should clearly justify the value before the CTA.",
                },
                {
                  q: "Can I tailor feedback for specific tech roles?",
                  a: "Yes. You can optionally select a role track (SWE, Backend, DevOps, ML, etc.) to bias feedback toward that track’s norms.",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-white/10 dark:bg-black/30"
                >
                  <p className="text-sm font-semibold">{item.q}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 bg-zinc-50 dark:border-white/10 dark:bg-black">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-black">
                S
              </span>
              <div>
                <p className="text-sm font-semibold">Screend</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">AI resume scans for tech jobs</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
              <a className="hover:text-zinc-950 dark:hover:text-white" href="#features">
                Features
              </a>
              <a className="hover:text-zinc-950 dark:hover:text-white" href="#how">
                How it works
              </a>
              <a className="hover:text-zinc-950 dark:hover:text-white" href="#pricing">
                Pricing
              </a>
              <a className="hover:text-zinc-950 dark:hover:text-white" href="#">
                Privacy
              </a>
            </div>
          </div>

          <p className="mt-8 text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Screend. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
