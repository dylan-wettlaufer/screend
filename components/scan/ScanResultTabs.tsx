'use client'

import { useState } from 'react'
import { ResumeAuditSidebar } from '@/components/scan/ResumeAuditSidebar'
import { applyAcceptedFeedbackToStructuredResume } from '@/lib/applyAcceptedFeedbackToStructuredResume'
import type {
  FeedbackItem as FeedbackItemType,
  ExportPdfErrorResponse,
  SectionDiagnostics,
  StructuredResume,
} from '@/lib/types'

interface ScanResultTabsProps {
  feedback: FeedbackItemType[]
  sectionDiagnostics: SectionDiagnostics | null
  keywordsMatched: string[]
  keywordsMissing: string[]
  isJobMatch: boolean
  scanId: string
  activeFeedbackId: string | null
  onFeedbackSelect: (id: string | null) => void
  structuredResume: StructuredResume | null
  onStructuredResumeChange: (r: StructuredResume | null) => void
}

export function ScanResultTabs({
  feedback,
  sectionDiagnostics,
  keywordsMatched,
  keywordsMissing,
  isJobMatch,
  scanId,
  activeFeedbackId,
  onFeedbackSelect,
  structuredResume,
  onStructuredResumeChange,
}: ScanResultTabsProps) {
  const [tab, setTab] = useState<'suggestions' | 'keywords'>('suggestions')
  const [accepted, setAccepted] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [downloadPdfError, setDownloadPdfError] = useState<string | null>(null)
  const [mergeNotice, setMergeNotice] = useState<string | null>(null)

  const tabs = [
    { id: 'suggestions' as const, label: 'Suggestions' },
    ...(isJobMatch ? [{ id: 'keywords' as const, label: 'Keywords' }] : []),
  ]

  function mergeAcceptedIntoStructured(nextAccepted: Set<string>) {
    if (!structuredResume) return

    const { resume, unmatchedLineItemIds } = applyAcceptedFeedbackToStructuredResume(
      structuredResume,
      feedback,
      nextAccepted,
    )
    onStructuredResumeChange(resume)

    if (unmatchedLineItemIds.length === 0) {
      setMergeNotice(null)
    } else if (unmatchedLineItemIds.length === 1) {
      setMergeNotice("Couldn't match this line in the editor — apply it manually.")
    } else {
      setMergeNotice("Some suggestions couldn't be matched in the editor — apply those manually.")
    }
  }

  function handleAccept(id: string) {
    const nextAccepted = new Set(accepted).add(id)
    setAccepted(nextAccepted)
    mergeAcceptedIntoStructured(nextAccepted)
  }

  function handleDismiss(id: string) {
    setAccepted((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setDismissed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleAcceptAll() {
    const ids = feedback.filter((i) => !dismissed.has(i.id)).map((i) => i.id)
    const nextAccepted = new Set(ids)
    setAccepted(nextAccepted)
    mergeAcceptedIntoStructured(nextAccepted)
  }

  async function handleDownloadPdf() {
    if (!structuredResume) return

    setIsDownloadingPdf(true)
    setDownloadPdfError(null)

    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          structured_resume: structuredResume,
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as ExportPdfErrorResponse
        setDownloadPdfError(err.error ?? 'Export failed.')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadPdfError('Network error. Please try again.')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const acceptedCount = accepted.size
  const canExportPdf = structuredResume != null

  return (
    <>
      <div className="flex flex-col min-h-0 flex-1">
        {/* Tab bar — stays visible; only content below scrolls */}
        <div
          className="shrink-0 flex items-center gap-1 border-b px-4 pt-3 pb-0"
          style={{
            borderColor: 'var(--color-border-strong)',
            background: 'var(--color-bg-raised)',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="pb-2 px-1 text-sm transition-colors"
              style={
                tab === t.id
                  ? {
                      color: 'var(--color-text-primary)',
                      borderBottom: '1.5px solid var(--color-accent)',
                      marginBottom: '-0.5px',
                    }
                  : {
                      color: 'var(--color-text-tertiary)',
                      borderBottom: '1.5px solid transparent',
                      marginBottom: '-0.5px',
                    }
              }
            >
              {t.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            {tab === 'suggestions' && feedback.length > 0 && (
              <>
                <span
                  className="font-mono text-xs rounded-pill border px-2 py-0.5"
                  style={{
                    color: acceptedCount > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    borderColor: acceptedCount > 0 ? 'var(--color-accent-dim)' : 'var(--color-border)',
                    background: acceptedCount > 0 ? 'var(--color-accent-muted)' : 'var(--color-bg-raised)',
                  }}
                >
                  {acceptedCount > 0
                    ? `${acceptedCount} accepted / ${feedback.length}`
                    : `${feedback.length} items`}
                </span>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="font-mono text-xs rounded-pill border px-2.5 py-0.5 transition-colors"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-dim)'
                    e.currentTarget.style.color = 'var(--color-accent)'
                    e.currentTarget.style.background = 'var(--color-accent-muted)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  Accept all
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => void handleDownloadPdf()}
              disabled={!canExportPdf || isDownloadingPdf}
              title={
                !canExportPdf
                  ? 'Resume editor data is not available for this scan.'
                  : undefined
              }
              className="font-mono text-xs rounded-pill border px-2.5 py-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: 'var(--color-accent-dim)',
                color: 'var(--color-accent)',
                background: 'var(--color-accent-muted)',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-dim)'
              }}
            >
              {isDownloadingPdf ? 'Downloading…' : 'Download PDF'}
            </button>
          </div>
      </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 pt-4"
          style={{ background: 'var(--color-bg-base)' }}
        >
        {downloadPdfError && (
          <p className="font-mono text-xs mb-3" style={{ color: 'var(--color-danger)' }}>
            {downloadPdfError}
          </p>
        )}
        {/* Suggestions tab */}
        {tab === 'suggestions' && (
          <div className={`flex flex-col gap-3 ${feedback.length > 0 ? 'pb-6' : ''}`}>
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
              <>
                {!canExportPdf && (
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    PDF export needs parsed resume data. Try re-running the scan if this persists.
                  </p>
                )}
                {mergeNotice && (
                  <p className="text-sm rounded-element border px-3 py-2" style={{ color: 'var(--color-warning)', borderColor: 'var(--color-border)' }}>
                    {mergeNotice}
                  </p>
                )}
                <ResumeAuditSidebar
                  feedback={feedback}
                  sectionDiagnostics={sectionDiagnostics}
                  accepted={accepted}
                  dismissed={dismissed}
                  activeFeedbackId={activeFeedbackId}
                  onAccept={handleAccept}
                  onDismiss={handleDismiss}
                  onFeedbackSelect={onFeedbackSelect}
                />
              </>
            )}
          </div>
        )}

        {/* Keywords tab */}
        {tab === 'keywords' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Matched
                </p>
                <span
                  className="font-mono text-xs rounded-pill border px-2 py-0.5"
                  style={{
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-raised)',
                  }}
                >
                  {keywordsMatched.length}
                </span>
              </div>
              {keywordsMatched.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No matched keywords found.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {keywordsMatched.map((kw) => (
                    <span
                      key={kw}
                      className="font-mono text-xs rounded-pill border px-2.5 py-1"
                      style={{
                        color: 'var(--color-success)',
                        borderColor: 'var(--color-accent-dim)',
                        background: 'var(--color-accent-muted)',
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <p
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Missing
                </p>
                <span
                  className="font-mono text-xs rounded-pill border px-2 py-0.5"
                  style={{
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-raised)',
                  }}
                >
                  {keywordsMissing.length}
                </span>
              </div>
              {keywordsMissing.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No missing keywords — great coverage.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {keywordsMissing.map((kw) => (
                    <span
                      key={kw}
                      className="font-mono text-xs rounded-pill border px-2.5 py-1"
                      style={{
                        color: 'var(--color-danger)',
                        borderColor: '#5a2020',
                        background: '#2a1515',
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}
