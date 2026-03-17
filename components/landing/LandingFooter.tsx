export function LandingFooter() {
  return (
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
  );
}
