import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const firstName = user.firstName ?? user.emailAddresses[0].emailAddress

  return (
    <main className="min-h-screen bg-bg-base flex items-start justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-text-primary text-xl font-medium mb-1">
            Welcome back, {firstName}
          </h1>
          <p className="text-text-secondary text-sm">
            Upload your resume to get an AI-powered analysis and improvement plan.
          </p>
        </div>

        <div className="rounded-card border border-border bg-bg-surface p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-text-primary text-sm font-medium">
              Analyze a resume
            </p>
            <p className="text-text-tertiary text-xs">
              Upload a PDF or DOCX file and get a detailed score with actionable feedback.
            </p>
          </div>
          <Link
            href="/scan"
            className="inline-flex h-9 items-center justify-center rounded-element bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 w-full sm:w-auto"
          >
            Upload resume
          </Link>
        </div>
      </div>
    </main>
  )
}
