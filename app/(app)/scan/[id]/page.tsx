import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ScoreRing } from '@/components/scan/ScoreRing'
import { SubScoreBar } from '@/components/scan/SubScoreBar'
import { ScanResultTabs } from '@/components/scan/ScanResultTabs'
import type { ScanRecord } from '@/lib/types'

interface ScanResultPageProps {
  params: Promise<{ id: string }>
}

const SUB_SCORES: { key: keyof Pick<ScanRecord, 'score_ats' | 'score_content' | 'score_writing' | 'score_job_match' | 'score_ready'>; label: string }[] = [
  { key: 'score_ats', label: 'ATS compatibility' },
  { key: 'score_content', label: 'Content & impact' },
  { key: 'score_writing', label: 'Writing quality' },
  { key: 'score_job_match', label: 'Job match' },
  { key: 'score_ready', label: 'Resume readiness' },
]

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

  return (
    <main className="min-h-screen px-4 pt-16 pb-20" style={{ background: 'var(--color-bg-base)' }}>
      <div className="mx-auto max-w-5xl">

        {/* Page heading */}
        <div className="mb-8">
          <p
            className="font-mono text-xs mb-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {new Date(typedScan.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
            {typedScan.role_track && <span> · {typedScan.role_track}</span>}
            {isJobMatch && (
              <span className="ml-1 rounded-pill border px-1.5 py-0.5" style={{
                borderColor: 'var(--color-accent-dim)',
                background: 'var(--color-accent-muted)',
                color: 'var(--color-accent)',
              }}>
                job match
              </span>
            )}
          </p>
          <h1 className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Resume analysis
            {jdLabel && (
              <span className="ml-2 text-base font-normal" style={{ color: 'var(--color-text-secondary)' }}>
                · {jdLabel}
              </span>
            )}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[340px_1fr]">

          {/* Left panel — scores */}
          <div className="flex flex-col gap-4">

            <div
              className="rounded-card border p-6 flex flex-col items-center"
              style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
            >
              <ScoreRing score={typedScan.overall_score} />
            </div>

            <div
              className="rounded-card border p-5 flex flex-col gap-4"
              style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
            >
              <p
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Breakdown
              </p>
              {SUB_SCORES.map(({ key, label }) => (
                <SubScoreBar
                  key={key}
                  label={label}
                  score={typedScan[key] ?? 0}
                />
              ))}
            </div>

          </div>

          {/* Right panel — tabbed feedback + keywords */}
          <ScanResultTabs
            feedback={feedback}
            keywordsMatched={keywordsMatched}
            keywordsMissing={keywordsMissing}
            isJobMatch={isJobMatch}
            scanId={typedScan.id}
            resumeText={typedScan.resume_text}
          />

        </div>
      </div>
    </main>
  )
}
