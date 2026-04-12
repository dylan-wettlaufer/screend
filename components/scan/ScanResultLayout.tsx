'use client'

import { useState, useEffect } from 'react'
import { useDebouncedStructuredResumeSave } from '@/lib/useDebouncedStructuredResumeSave'
import { ScoreRing } from '@/components/scan/ScoreRing'
import { SubScoreBar } from '@/components/scan/SubScoreBar'
import { ScanResultTabs } from '@/components/scan/ScanResultTabs'
import { ResumeAnnotationPanel, type WorkbenchTab } from '@/components/scan/ResumeAnnotationPanel'
import type {
  ScanRecord,
  FeedbackItem,
  SectionDiagnostics,
  StructuredResume,
  SectionDiagnosticKey,
} from '@/lib/types'

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
  sectionDiagnostics: SectionDiagnostics | null
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
  sectionDiagnostics,
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
  const [selectedSection, setSelectedSection] = useState<SectionDiagnosticKey | null>(null)
  const [jdDeltaOverall, setJdDeltaOverall] = useState(0)
  const [jdDeltaJobMatch, setJdDeltaJobMatch] = useState(0)
  const [editorFlashFieldPath, setEditorFlashFieldPath] = useState<string | null>(null)
  const [editorFlashNonce, setEditorFlashNonce] = useState(0)

  useEffect(() => {
    setStructuredResume(initialStructuredResume)
  }, [scan.id, initialStructuredResume])

  useEffect(() => {
    setJdDeltaOverall(0)
    setJdDeltaJobMatch(0)
    setEditorFlashFieldPath(null)
    setEditorFlashNonce(0)
    setSelectedSection(null)
  }, [scan.id])

  const displayOverall = isJobMatch
    ? Math.min(100, scan.overall_score + jdDeltaOverall)
    : scan.overall_score

  const displayJobMatch = isJobMatch
    ? Math.min(20, scan.score_job_match + jdDeltaJobMatch)
    : scan.score_job_match

  function bumpJdScores(severity: FeedbackItem['severity']) {
    const o = severity === 'high' ? 3 : severity === 'medium' ? 2 : 1
    const j = severity === 'high' ? 2 : 1
    setJdDeltaOverall((d) => Math.min(100 - scan.overall_score, d + o))
    setJdDeltaJobMatch((d) => Math.min(20 - scan.score_job_match, d + j))
  }

  function handleSectionSelect(key: SectionDiagnosticKey | null) {
    setSelectedSection(key)
    setWorkbenchTab('editor')
  }

  function handleJdFeedbackSynced(item: FeedbackItem, fieldPath: string | null) {
    if (!isJobMatch) return
    bumpJdScores(item.severity)
    if (fieldPath) {
      setEditorFlashFieldPath(fieldPath)
      setEditorFlashNonce((n) => n + 1)
    }
  }

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

  const showResumePanel = viewMode === 'split' || viewMode === 'document'
  const showFeedbackPanel = viewMode === 'split' || viewMode === 'analysis'
  const isSplit = viewMode === 'split'

  return (
    <div className="h-full flex flex-col gap-3">
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

      {/* ── Score strip (short single row on large screens) ────── */}
      <div
        className="shrink-0 rounded-card border px-3 py-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
        style={{
          background: 'var(--color-bg-raised)',
          borderColor: 'var(--color-border-strong)',
        }}
      >
        <ScoreRing
          score={displayOverall}
          dense
          qualityLabel={isJobMatch ? 'JD Match Quality' : null}
        />
        <div
          className="hidden sm:block h-px sm:h-auto sm:w-px sm:self-stretch shrink-0"
          style={{ background: 'var(--color-border-strong)' }}
          aria-hidden
        />
        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-2">
          {SUB_SCORES.map(({ key, label }) => {
            const score =
              key === 'score_job_match' && isJobMatch
                ? displayJobMatch
                : scan[key] ?? 0
            const barLabel =
              isJobMatch && key === 'score_job_match' ? 'JD alignment' : label
            return <SubScoreBar key={key} label={barLabel} score={score} compact dense />
          })}
        </div>
      </div>

      {/* ── Two-panel area: feedback left, resume right ───────── */}
      <div
        className={[
          'min-h-0 flex-1',
          isSplit
            ? 'grid gap-4 lg:grid-cols-2 lg:[grid-template-rows:minmax(0,1fr)]'
            : 'flex gap-4',
        ].join(' ')}
      >
        {/* Left panel — suggestions / keywords */}
        {showFeedbackPanel && (
          <section
            className={[
              'min-h-0 flex flex-col rounded-card border overflow-hidden flex-1',
              isSplit ? 'hidden lg:flex h-full' : 'hidden lg:flex flex-1 h-full',
            ].join(' ')}
            style={{
              borderColor: 'var(--color-border-strong)',
              background: 'var(--color-bg-surface)',
            }}
          >
            <ScanResultTabs
              feedback={feedback}
              sectionDiagnostics={sectionDiagnostics}
              keywordsMatched={keywordsMatched}
              keywordsMissing={keywordsMissing}
              isJobMatch={isJobMatch}
              scanId={scan.id}
              activeFeedbackId={activeFeedbackId}
              onFeedbackSelect={handleFeedbackSelect}
              structuredResume={structuredResume}
              onStructuredResumeChange={setStructuredResume}
              selectedSection={selectedSection}
              onSectionSelect={handleSectionSelect}
              onJdFeedbackSynced={handleJdFeedbackSynced}
            />
          </section>
        )}

        {/* Right panel — resume preview / editor */}
        {showResumePanel && (
          <section
            className={[
              'rounded-card border flex flex-col min-h-0',
              isSplit
                ? 'hidden lg:flex h-full'
                : 'hidden lg:flex flex-1 h-full',
            ].join(' ')}
            style={{
              background: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border-strong)',
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
              scrollSectionKey={selectedSection}
              flashFieldPath={editorFlashFieldPath}
              flashFieldNonce={editorFlashNonce}
            />
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
