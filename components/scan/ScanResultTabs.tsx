'use client'

import { useState } from 'react'
import { FeedbackItem } from '@/components/scan/FeedbackItem'
import type { FeedbackItem as FeedbackItemType } from '@/lib/types'

interface ScanResultTabsProps {
  feedback: FeedbackItemType[]
  keywordsMatched: string[]
  keywordsMissing: string[]
  isJobMatch: boolean
}

export function ScanResultTabs({
  feedback,
  keywordsMatched,
  keywordsMissing,
  isJobMatch,
}: ScanResultTabsProps) {
  const [tab, setTab] = useState<'suggestions' | 'keywords'>('suggestions')
  const [accepted, setAccepted] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const tabs = [
    { id: 'suggestions' as const, label: 'Suggestions' },
    ...(isJobMatch ? [{ id: 'keywords' as const, label: 'Keywords' }] : []),
  ]

  function handleAccept(id: string) {
    setAccepted((prev) => new Set(prev).add(id))
  }

  function handleDismiss(id: string) {
    // If currently accepted, un-accept first
    setAccepted((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    // Toggle dismiss (undo if already dismissed)
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

  const acceptedCount = accepted.size
  const canGenerate = acceptedCount > 0

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Tab bar */}
        <div
          className="flex items-center gap-1 border-b"
          style={{ borderColor: 'var(--color-border)' }}
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

          {tab === 'suggestions' && feedback.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              {/* Item count pill */}
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

              {/* Accept all button */}
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

        {/* Suggestions tab */}
        {tab === 'suggestions' && (
          <div className={`flex flex-col gap-3 ${canGenerate ? 'pb-24' : ''}`}>
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
                <FeedbackItem
                  key={item.id}
                  item={item}
                  isAccepted={accepted.has(item.id)}
                  isDismissed={dismissed.has(item.id)}
                  onAccept={() => handleAccept(item.id)}
                  onDismiss={() => handleDismiss(item.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Keywords tab */}
        {tab === 'keywords' && (
          <div className="flex flex-col gap-5">
            {/* Matched */}
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

            {/* Missing */}
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

      {/* Sticky bottom bar — only visible when at least one item is accepted */}
      {canGenerate && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-t"
          style={{
            background: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-text-primary)' }}>{acceptedCount}</span>
            {' '}suggestion{acceptedCount !== 1 ? 's' : ''} accepted
          </p>
          <button
            type="button"
            onClick={() => {
              // TODO: wire to rewrite API
              console.log('Generate resume with accepted IDs:', Array.from(accepted))
            }}
            className="rounded-element px-5 py-2 text-sm font-medium transition-opacity"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-bg-base)',
            }}
          >
            Generate new resume
          </button>
        </div>
      )}
    </>
  )
}
