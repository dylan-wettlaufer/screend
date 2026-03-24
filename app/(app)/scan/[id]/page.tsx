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
      <div className="h-full flex flex-col gap-4">
        <div>
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

        <div className="grid h-[calc(100%-4.5rem)] grid-cols-1 gap-4 xl:grid-cols-[1fr_1.1fr] xl:[grid-template-rows:minmax(0,1fr)]">
          {/* Left panel — submitted resume */}
          <section
            className="hidden xl:flex rounded-card border bg-bg-surface p-4 min-h-0 h-full flex-col"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="mb-3">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Submitted resume
              </p>
            </div>
            <div
              className="group relative flex-1 min-h-0 rounded-element border overflow-hidden"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {/* Hover overlay — only visible when hovering the resume panel */}
              {resumeSignedUrl && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-end px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: 'linear-gradient(to bottom, rgba(24,24,27,0.85) 60%, transparent)' }}
                >
                  <a
                    href={resumeSignedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto font-mono text-xs underline underline-offset-2 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Open file
                  </a>
                </div>
              )}

              {resumeSignedUrl && resumeIsPdf ? (
                <iframe
                  src={`${resumeSignedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title="Submitted resume PDF"
                  className="w-full h-full block"
                />
              ) : resumeSignedUrl ? (
                <div className="h-full flex items-center justify-center text-center px-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Preview is not available for this file type.
                    </p>
                    <a
                      href={resumeSignedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs underline underline-offset-2"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      Open submitted file
                    </a>
                  </div>
                </div>
              ) : (
                <pre
                  className="text-sm leading-relaxed whitespace-pre-wrap break-words font-sans"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {typedScan.resume_text}
                </pre>
              )}
            </div>
          </section>

          {/* Right panel — scores + suggestions/keywords */}
          <section className="min-h-0 h-full flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
              <div
                className="rounded-card border p-4 flex items-center justify-center"
                style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
              >
                <ScoreRing score={typedScan.overall_score} />
              </div>

              <div
                className="rounded-card border p-4 flex flex-col gap-3"
                style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Score breakdown
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

            <div className="min-h-0 rounded-card border bg-bg-surface p-4 overflow-y-auto" style={{ borderColor: 'var(--color-border)' }}>
              <ScanResultTabs
                feedback={feedback}
                keywordsMatched={keywordsMatched}
                keywordsMissing={keywordsMissing}
                isJobMatch={isJobMatch}
                scanId={typedScan.id}
                resumeText={typedScan.resume_text}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
