'use client'

import { useState, useEffect } from 'react'
import { useDebouncedStructuredResumeSave } from '@/lib/useDebouncedStructuredResumeSave'
import { ScoreRing } from '@/components/scan/ScoreRing'
import { SubScoreBar } from '@/components/scan/SubScoreBar'
import { ScanResultTabs } from '@/components/scan/ScanResultTabs'
import { ResumeAnnotationPanel, type WorkbenchTab } from '@/components/scan/ResumeAnnotationPanel'
import type { ScanRecord, FeedbackItem, StructuredResume } from '@/lib/types'

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
  /** From DB structured_resume_json */
  initialStructuredResume: StructuredResume | null
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
  initialStructuredResume,
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
  const [structuredResume, setStructuredResume] = useState<StructuredResume | null>(
    () => initialStructuredResume,
  )
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('editor')

  useEffect(() => {
    setStructuredResume(initialStructuredResume)
  }, [scan.id, initialStructuredResume])

  const { status: structuredSaveStatus, errorMessage: structuredSaveError } =
    useDebouncedStructuredResumeSave(scan.id, structuredResume, initialStructuredResume)

  const structuredSaveLabel =
    structuredSaveStatus === 'pending'
      ? 'Unsaved changes'
      : structuredSaveStatus === 'saving'
        ? 'Saving…'
        : structuredSaveStatus === 'saved'
          ? 'All changes saved'
          : structuredSaveStatus === 'error'
            ? (structuredSaveError ?? "Couldn't save")
            : null

  const structuredSaveColor =
    structuredSaveStatus === 'error'
      ? 'var(--color-danger)'
      : structuredSaveStatus === 'pending'
        ? 'var(--color-text-tertiary)'
        : structuredSaveStatus === 'saved'
          ? 'var(--color-success)'
          : 'var(--color-text-secondary)'

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
          {structuredSaveLabel != null && (
            <p className="font-mono text-xs mt-1" style={{ color: structuredSaveColor }}>
              {structuredSaveLabel}
            </p>
          )}
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
            ? 'grid gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.28fr)] lg:[grid-template-rows:minmax(0,1fr)]'
            : 'flex gap-4',
        ].join(' ')}
      >
        {/* Left panel — resume */}
        {showLeft && (
          <section
            className={[
              'rounded-card border flex flex-col min-h-0',
              isSplit
                ? 'hidden lg:flex h-full'
                : 'hidden lg:flex flex-1 h-full',
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
              structuredResume={structuredResume}
              isBootstrappingStructure={false}
              workbenchTab={workbenchTab}
              onWorkbenchTabChange={setWorkbenchTab}
              onStructuredResumeChange={setStructuredResume}
            />
          </section>
        )}

        {/* Right panel — scores + tabs */}
        {showRight && (
          <section
            className={[
              'min-h-0 flex flex-col gap-3',
              isSplit ? 'h-full' : 'flex-1 h-full',
            ].join(' ')}
          >
            {/* Score cards — compact row so suggestions panel gets more vertical space */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,132px)_1fr] shrink-0 lg:items-stretch">
              <div
                className="rounded-card border p-2.5 flex items-center justify-center"
                style={{
                  background: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <ScoreRing score={scan.overall_score} compact />
              </div>
              <div
                className="rounded-card border px-3 py-2.5 flex flex-col gap-2 justify-center"
                style={{
                  background: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Score breakdown
                </p>
                {SUB_SCORES.map(({ key, label }) => (
                  <SubScoreBar key={key} label={label} score={scan[key] ?? 0} compact />
                ))}
              </div>
            </div>

            {/* Tabs panel — tab bar fixed, list scrolls */}
            <div
              className="min-h-0 flex-1 flex flex-col rounded-card border bg-bg-surface overflow-hidden"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <ScanResultTabs
                feedback={feedback}
                keywordsMatched={keywordsMatched}
                keywordsMissing={keywordsMissing}
                isJobMatch={isJobMatch}
                scanId={scan.id}
                activeFeedbackId={activeFeedbackId}
                onFeedbackSelect={handleFeedbackSelect}
                structuredResume={structuredResume}
                onStructuredResumeChange={setStructuredResume}
                onSuggestionAccepted={() => setWorkbenchTab('editor')}
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
