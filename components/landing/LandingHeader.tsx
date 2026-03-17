import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
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
          <Button size="sm" aria-disabled="true" className="hover:bg-accent/90">
            Go to dashboard
          </Button>
        </div>
      </div>
    </header>
  );
}
