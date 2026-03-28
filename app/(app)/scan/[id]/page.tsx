import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ScanResultLayout } from '@/components/scan/ScanResultLayout'
import { StructuredResumeSchema, type ScanRecord, type StructuredResume } from '@/lib/types'

interface ScanResultPageProps {
  params: Promise<{ id: string }>
}

export default async function ScanResultPage({ params }: ScanResultPageProps) {
  const { id } = await params

  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const supabase = createAdminClient()

  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()

  if (!dbUser) redirect('/sign-in')

  const { data: scan } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .eq('user_id', dbUser.id)
    .single()

  if (!scan) notFound()

  const typedScan = scan as unknown as ScanRecord

  const rawStructured = typedScan.structured_resume_json
  let initialStructuredResume: StructuredResume | null = null
  if (rawStructured != null && typeof rawStructured === 'object') {
    const parsed = StructuredResumeSchema.safeParse(rawStructured)
    if (parsed.success) {
      initialStructuredResume = parsed.data
    }
  }

  if (typedScan.overall_score == null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-base)' }}>
        <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Analysis in progress…
        </p>
      </div>
    )
  }

  const feedback = Array.isArray(typedScan.feedback_json) ? typedScan.feedback_json : []
  const keywordsMatched = Array.isArray(typedScan.keywords_matched) ? typedScan.keywords_matched : []
  const keywordsMissing = Array.isArray(typedScan.keywords_missing) ? typedScan.keywords_missing : []
  const isJobMatch = typedScan.mode === 'job_match'

  const jdLabel = typedScan.jd_title
    ? typedScan.jd_company
      ? `${typedScan.jd_title} at ${typedScan.jd_company}`
      : typedScan.jd_title
    : null

  const resumeFilePath = typedScan.resume_file_path
  const resumeIsPdf = resumeFilePath?.toLowerCase().endsWith('.pdf') ?? false

  let resumeSignedUrl: string | null = null
  if (resumeFilePath) {
    const { data } = await supabase.storage
      .from('resumes')
      .createSignedUrl(resumeFilePath, 60 * 10)
    resumeSignedUrl = data?.signedUrl ?? null
  }

  return (
    <main className="h-screen px-6 pt-6 pb-6" style={{ background: 'var(--color-bg-base)' }}>
      <ScanResultLayout
        scan={typedScan}
        initialStructuredResume={initialStructuredResume}
        feedback={feedback}
        keywordsMatched={keywordsMatched}
        keywordsMissing={keywordsMissing}
        isJobMatch={isJobMatch}
        resumeSignedUrl={resumeSignedUrl}
        resumeIsPdf={resumeIsPdf}
        jdLabel={jdLabel}
      />
    </main>
  )
}
