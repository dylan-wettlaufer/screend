import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const firstName = user.firstName ?? user.emailAddresses[0].emailAddress

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
      </div>
    </main>
  )
}
