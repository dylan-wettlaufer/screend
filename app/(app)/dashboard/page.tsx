import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"

interface DashboardScanItem {
  id: string
  mode: "general" | "job_match"
  overall_score: number | null
  role_track: string | null
  jd_title: string | null
  jd_company: string | null
  created_at: string
}

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const firstName = user.firstName ?? user.emailAddresses[0].emailAddress
  const supabase = createAdminClient()

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single()

  const scans: DashboardScanItem[] = dbUser
    ? ((await supabase
        .from("scans")
        .select("id, mode, overall_score, role_track, jd_title, jd_company, created_at")
        .eq("user_id", dbUser.id)
        .order("created_at", { ascending: false })
        .limit(8)).data as DashboardScanItem[] | null) ?? []
    : []

  return (
    <main className="bg-bg-base px-6 pt-12 pb-16">
      <div className="w-full max-w-4xl">
        <div className="mb-10">
          <h1 className="text-text-primary text-2xl font-medium mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-text-secondary text-sm">
            Choose a scan workflow from the cards below or from the sidebar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-card border border-border bg-bg-surface p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-text-primary text-sm font-medium">
                General scan
              </p>
              <p className="text-text-tertiary text-xs">
                Score your resume against general ATS and tech hiring best practices.
              </p>
            </div>
            <Link
              href="/scan?mode=general"
              className="inline-flex h-9 items-center justify-center rounded-element bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 w-full sm:w-auto"
            >
              Start general scan
            </Link>
          </div>

          <div className="rounded-card border border-border bg-bg-surface p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-text-primary text-sm font-medium">
                Job scan
              </p>
              <p className="text-text-tertiary text-xs">
                Match your resume to a specific job description and uncover keyword gaps.
              </p>
            </div>
            <Link
              href="/scan?mode=job_match"
              className="inline-flex h-9 items-center justify-center rounded-element bg-bg-raised border border-border px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover w-full sm:w-auto"
            >
              Start job scan
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-text-primary text-sm font-medium">Recent scans</h2>
            <span className="font-mono text-xs text-text-tertiary">
              {scans.length} shown
            </span>
          </div>

          {scans.length === 0 ? (
            <div className="rounded-card border border-border bg-bg-surface p-6">
              <p className="text-sm text-text-secondary">
                No scans yet. Start a general scan or job scan to see your history here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scans.map((scan) => {
                const modeLabel =
                  scan.mode === "job_match" ? "Job scan" : "General scan"
                const scoreLabel =
                  typeof scan.overall_score === "number"
                    ? `${scan.overall_score}/100`
                    : "Pending"
                const targetLabel =
                  scan.mode === "job_match" && scan.jd_title
                    ? scan.jd_company
                      ? `${scan.jd_title} at ${scan.jd_company}`
                      : scan.jd_title
                    : scan.role_track || "General tech"

                return (
                  <Link
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="rounded-card border border-border bg-bg-surface p-4 transition-colors hover:border-border-strong hover:bg-bg-hover"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-text-primary text-sm font-medium">
                        {modeLabel}
                      </span>
                      <span className="font-mono text-xs rounded-pill border border-border bg-bg-raised px-2 py-0.5 text-text-secondary">
                        {scoreLabel}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mb-2 truncate">
                      {targetLabel}
                    </p>
                    <p className="font-mono text-xs text-text-tertiary">
                      {new Date(scan.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
