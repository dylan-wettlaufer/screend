'use client'

import { useState } from 'react'
import { ScoreRing } from '@/components/scan/ScoreRing'
import { SubScoreBar } from '@/components/scan/SubScoreBar'
import { ScanResultTabs } from '@/components/scan/ScanResultTabs'
import { ResumeAnnotationPanel } from '@/components/scan/ResumeAnnotationPanel'
import type { ScanRecord, FeedbackItem } from '@/lib/types'

type ViewMode = 'split' | 'analysis' | 'document'

const SUB_SCORES: {
  key: keyof Pick<
    ScanRecord,
    'score_ats' | 'score_content' | 'score_writing' | 'score_job_match' | 'score_ready'
  >
  label: string
}[] = [
  { key: 'score_ats', label: 'ATS compatibility' },
  { key: 'score_content', label: 'Content & impact' },
  { key: 'score_writing', label: 'Writing quality' },
  { key: 'score_job_match', label: 'Job match' },
  { key: 'score_ready', label: 'Resume readiness' },
]

interface ScanResultLayoutProps {
  scan: ScanRecord
  feedback: FeedbackItem[]
  keywordsMatched: string[]
  keywordsMissing: string[]
  isJobMatch: boolean
  resumeSignedUrl: string | null
  resumeIsPdf: boolean
  jdLabel: string | null
}

export function ScanResultLayout({
  scan,
  feedback,
  keywordsMatched,
  keywordsMissing,
  isJobMatch,
  resumeSignedUrl,
  resumeIsPdf,
  jdLabel,
}: ScanResultLayoutProps) {
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  function handleFeedbackSelect(id: string | null) {
    setActiveFeedbackId((prev) => (prev === id ? null : id))
  }

  const showLeft = viewMode === 'split' || viewMode === 'document'
  const showRight = viewMode === 'split' || viewMode === 'analysis'
  const isSplit = viewMode === 'split'

  return (
    <div className="h-full flex flex-col gap-4">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div>
          <p className="font-mono text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
            {new Date(scan.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {scan.role_track && <span> · {scan.role_track}</span>}
            {isJobMatch && (
              <span
                className="ml-1 rounded-pill border px-1.5 py-0.5"
                style={{
                  borderColor: 'var(--color-accent)',
                  background: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)',
                }}
              >
                job match
              </span>
            )}
          </p>
          <h1 className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Resume analysis
            {jdLabel && (
              <span
                className="ml-2 text-base font-normal"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                · {jdLabel}
              </span>
            )}
          </h1>
        </div>

        {/* View toggle — desktop only */}
        <div
          className="hidden xl:flex items-center gap-0.5 rounded-element border p-0.5 shrink-0"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
        >
          <ViewToggleButton
            active={viewMode === 'document'}
            onClick={() => setViewMode(viewMode === 'document' ? 'split' : 'document')}
            title="Document focus"
          >
            <DocumentIcon />
          </ViewToggleButton>
          <ViewToggleButton
            active={viewMode === 'split'}
            onClick={() => setViewMode('split')}
            title="Split view"
          >
            <SplitIcon />
          </ViewToggleButton>
          <ViewToggleButton
            active={viewMode === 'analysis'}
            onClick={() => setViewMode(viewMode === 'analysis' ? 'split' : 'analysis')}
            title="Analysis focus"
          >
            <AnalysisIcon />
          </ViewToggleButton>
        </div>
      </div>

      {/* ── Two-panel area ──────────────────────────────────────── */}
      <div
        className={[
          'min-h-0 flex-1',
          isSplit
            ? 'grid gap-4 xl:grid-cols-[1fr_1.1fr] xl:[grid-template-rows:minmax(0,1fr)]'
            : 'flex gap-4',
        ].join(' ')}
      >
        {/* Left panel — resume */}
        {showLeft && (
          <section
            className={[
              'rounded-card border flex flex-col min-h-0',
              isSplit
                ? 'hidden xl:flex h-full'
                : 'hidden xl:flex flex-1 h-full',
            ].join(' ')}
            style={{
              background: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <ResumeAnnotationPanel
              resumeText={scan.resume_text}
              resumeSignedUrl={resumeSignedUrl}
              resumeIsPdf={resumeIsPdf}
              feedback={feedback}
              keywordsMissing={keywordsMissing}
              activeFeedbackId={activeFeedbackId}
            />
          </section>
        )}

        {/* Right panel — scores + tabs */}
        {showRight && (
          <section
            className={[
              'min-h-0 flex flex-col gap-4',
              isSplit ? 'h-full' : 'flex-1 h-full',
            ].join(' ')}
          >
            {/* Score cards */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr] shrink-0">
              <div
                className="rounded-card border p-4 flex items-center justify-center"
                style={{
                  background: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <ScoreRing score={scan.overall_score} />
              </div>
              <div
                className="rounded-card border p-4 flex flex-col gap-3"
                style={{
                  background: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Score breakdown
                </p>
                {SUB_SCORES.map(({ key, label }) => (
                  <SubScoreBar key={key} label={label} score={scan[key] ?? 0} />
                ))}
              </div>
            </div>

            {/* Tabs panel */}
            <div
              className="min-h-0 flex-1 rounded-card border bg-bg-surface p-4 overflow-y-auto"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <ScanResultTabs
                feedback={feedback}
                keywordsMatched={keywordsMatched}
                keywordsMissing={keywordsMissing}
                isJobMatch={isJobMatch}
                scanId={scan.id}
                resumeText={scan.resume_text}
                activeFeedbackId={activeFeedbackId}
                onFeedbackSelect={handleFeedbackSelect}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ── View toggle helpers ──────────────────────────────────────────────────────

interface ViewToggleButtonProps {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}

function ViewToggleButton({ active, onClick, title, children }: ViewToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-[6px] p-1.5 transition-colors"
      style={{
        background: active ? 'var(--color-bg-hover)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--color-text-secondary)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--color-text-tertiary)'
      }}
    >
      {children}
    </button>
  )
}

function SplitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="5.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="2.5" width="5.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="5" y1="10.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function AnalysisIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="3.5" rx="0.75" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="7" width="12" height="2.5" rx="0.75" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="11.5" width="7.5" height="2.5" rx="0.75" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
