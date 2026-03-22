import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ResumeUpload } from "@/components/scan/ResumeUpload"

export default async function ScanPage() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  return (
    <main className="min-h-screen bg-bg-base flex items-start justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-text-primary text-xl font-medium mb-1">
            Upload your resume
          </h1>
          <p className="text-text-secondary text-sm">
            We&apos;ll analyze it and tell you exactly how to improve it.
          </p>
        </div>

        <div className="rounded-card border border-border bg-bg-surface p-6">
          <ResumeUpload />
        </div>
      </div>
    </main>
  )
}
