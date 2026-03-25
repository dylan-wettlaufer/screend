'use client'

import { useState } from 'react'
import { FeedbackItem } from '@/components/scan/FeedbackItem'
import { DiffView } from '@/components/scan/DiffView'
import type {
  FeedbackItem as FeedbackItemType,
  RewriteDiffItem,
  RewriteResponse,
  RewriteErrorResponse,
} from '@/lib/types'

interface ScanResultTabsProps {
  feedback: FeedbackItemType[]
  keywordsMatched: string[]
  keywordsMissing: string[]
  isJobMatch: boolean
  scanId: string
  resumeText: string
  activeFeedbackId: string | null
  onFeedbackSelect: (id: string | null) => void
}

type RewriteState = 'idle' | 'loading' | 'error' | 'done'

export function ScanResultTabs({
  feedback,
  keywordsMatched,
  keywordsMissing,
  isJobMatch,
  scanId,
  activeFeedbackId,
  onFeedbackSelect,
}: ScanResultTabsProps) {
  const [tab, setTab] = useState<'suggestions' | 'keywords'>('suggestions')
  const [accepted, setAccepted] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const [rewriteState, setRewriteState] = useState<RewriteState>('idle')
  const [rewriteError, setRewriteError] = useState<string | null>(null)
  const [diff, setDiff] = useState<RewriteDiffItem[]>([])

  const tabs = [
    { id: 'suggestions' as const, label: 'Suggestions' },
    ...(isJobMatch ? [{ id: 'keywords' as const, label: 'Keywords' }] : []),
  ]

  function handleAccept(id: string) {
    setAccepted((prev) => new Set(prev).add(id))
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
    setAccepted(new Set(ids))
  }

  async function handleGenerate() {
    setRewriteState('loading')
    setRewriteError(null)

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          accepted_feedback_item_ids: Array.from(accepted),
        }),
      })

      const data: RewriteResponse | RewriteErrorResponse = await res.json()

      if (!res.ok) {
        setRewriteError((data as RewriteErrorResponse).error ?? 'Something went wrong.')
        setRewriteState('error')
        return
      }

      setDiff((data as RewriteResponse).diff)
      setRewriteState('done')
    } catch {
      setRewriteError('Network error. Please try again.')
      setRewriteState('error')
    }
  }

  function handleDownloadPdf(acceptedDiff: RewriteDiffItem[]) {
    // TODO: implement PDF export
    console.log('Download PDF with changes:', acceptedDiff)
  }

  function handleDownloadDocx(acceptedDiff: RewriteDiffItem[]) {
    // TODO: implement DOCX export
    console.log('Download DOCX with changes:', acceptedDiff)
  }

  const acceptedCount = accepted.size
  const canGenerate = acceptedCount > 0
  const isGenerating = rewriteState === 'loading'
  const isDone = rewriteState === 'done'

  return (
    <>
      <div className="flex flex-col min-h-0 flex-1">
        {/* Tab bar — stays visible; only content below scrolls */}
        <div
          className="shrink-0 flex items-center gap-1 border-b px-4 pt-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-surface)',
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

          {tab === 'suggestions' && feedback.length > 0 && !isDone && (
            <div className="ml-auto flex items-center gap-2">
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
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3">
        {/* Suggestions tab */}
        {tab === 'suggestions' && (
          <div className={`flex flex-col gap-3 ${canGenerate && !isDone ? 'pb-24' : ''}`}>
            {isDone ? (
              <DiffView
                diff={diff}
                onDownloadPdf={handleDownloadPdf}
                onDownloadDocx={handleDownloadDocx}
              />
            ) : feedback.length === 0 ? (
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
                <FeedbackItem
                  key={item.id}
                  item={item}
                  isAccepted={accepted.has(item.id)}
                  isDismissed={dismissed.has(item.id)}
                  isActive={activeFeedbackId === item.id}
                  onAccept={() => handleAccept(item.id)}
                  onDismiss={() => handleDismiss(item.id)}
                  onSelect={() => onFeedbackSelect(item.id)}
                />
              ))
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

      {/* Sticky bottom bar */}
      {canGenerate && !isDone && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-t"
          style={{
            background: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex flex-col gap-0.5">
            <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-text-primary)' }}>{acceptedCount}</span>
              {' '}suggestion{acceptedCount !== 1 ? 's' : ''} accepted
            </p>
            {rewriteState === 'error' && rewriteError && (
              <p className="font-mono text-xs" style={{ color: 'var(--color-danger)' }}>
                {rewriteError}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-element px-5 py-2 text-sm font-medium transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-bg-base)',
            }}
          >
            {isGenerating ? 'Generating…' : 'Generate new resume'}
          </button>
        </div>
      )}
    </>
  )
}
