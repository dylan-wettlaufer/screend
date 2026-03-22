import { currentUser } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ScoreRing } from '@/components/scan/ScoreRing'
import { SubScoreBar } from '@/components/scan/SubScoreBar'
import { FeedbackItem } from '@/components/scan/FeedbackItem'
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

  // Look up user's Supabase ID
  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()

  if (!dbUser) redirect('/sign-in')

  // Fetch scan, ensuring it belongs to the authenticated user
  const { data: scan } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .eq('user_id', dbUser.id)
    .single()

  if (!scan) notFound()

  const typedScan = scan as unknown as ScanRecord

  // Guard: if AI scores aren't present yet (shouldn't happen, but just in case)
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
            {typedScan.role_track && (
              <span> · {typedScan.role_track}</span>
            )}
          </p>
          <h1
            className="text-xl font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Resume analysis
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[340px_1fr]">

          {/* Left panel — scores */}
          <div className="flex flex-col gap-4">

            {/* Score ring card */}
            <div
              className="rounded-card border p-6 flex flex-col items-center"
              style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
            >
              <ScoreRing score={typedScan.overall_score} />
            </div>

            {/* Sub-scores card */}
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

          {/* Right panel — feedback */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <p
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Suggestions
              </p>
              <span
                className="font-mono text-xs rounded-pill border px-2 py-0.5"
                style={{
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-raised)',
                }}
              >
                {feedback.length} items
              </span>
            </div>

            {feedback.length === 0 ? (
              <div
                className="rounded-card border px-5 py-8 text-center"
                style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No suggestions — your resume looks great.
                </p>
              </div>
            ) : (
              feedback.map((item) => (
                <FeedbackItem key={item.id} item={item} />
              ))
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
