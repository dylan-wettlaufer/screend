import { Badge } from "@/components/ui/badge";

const pills = ["ATS-friendly", "Tech keyword focus", "Line-level edits", "Export PDF or DOCX"];

export function SocialProofSection() {
  return (
    <section className="border-y border-accent-dim bg-bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-text-secondary">
            Built for ATS and tech roles.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pills.map((pill) => (
              <Badge
                key={pill}
                className="rounded-pill border-accent-dim bg-accent-muted px-3 py-1 font-mono text-accent"
              >
                {pill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
