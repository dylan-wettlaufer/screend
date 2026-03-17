import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Five-part scoring 0–100",
    body: "See what to fix first, fast.",
  },
  {
    title: "Job description matching",
    body: "Know what’s missing for a role.",
  },
  {
    title: "Keyword gap analysis",
    body: "Matched vs missing keywords.",
  },
  {
    title: "Accept edits line by line",
    body: "Approve changes one line at a time.",
  },
  {
    title: "Diff view before download",
    body: "Preview changes before export.",
  },
  {
    title: "Export to PDF or DOCX",
    body: "Export a clean PDF or DOCX.",
  },
];

const roleTracks = ["SWE", "Backend", "Frontend", "Devops", "Data", "ML", "Mobile"];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-medium text-text-primary sm:text-3xl">
          Everything you need for tech role resumes
        </h2>
        <p className="mt-3 text-text-secondary">Scan, fix, and export in minutes.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="rounded-card border border-border bg-bg-surface p-6 ring-0 gap-0"
          >
            <p className="text-sm font-medium text-text-primary">{feature.title}</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{feature.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-10 rounded-card border border-border bg-bg-surface p-6 ring-0 gap-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Role tracks (optional)</p>
            <p className="mt-1 text-sm text-text-secondary">Tune feedback for your target role.</p>
          </div>
          <div className="flex flex-wrap gap-2">
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
      </Card>
    </section>
  );
}
