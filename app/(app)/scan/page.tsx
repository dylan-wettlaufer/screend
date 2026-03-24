import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ResumeUpload } from "@/components/scan/ResumeUpload"
import type { ScanMode } from "@/lib/types"

interface ScanPageProps {
  searchParams?: Promise<{ mode?: string }>
}

export default async function ScanPage({ searchParams }: ScanPageProps) {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const params = searchParams ? await searchParams : undefined
  const initialMode: ScanMode = params?.mode === "job_match" ? "job_match" : "general"

  return (
    <main className="bg-bg-base flex items-start justify-center px-6 pt-12 pb-16">
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
          <ResumeUpload initialMode={initialMode} />
        </div>
      </div>
    </main>
  )
}
