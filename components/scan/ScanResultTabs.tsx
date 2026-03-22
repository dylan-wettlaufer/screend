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

  const tabs = [
    { id: 'suggestions' as const, label: 'Suggestions' },
    ...(isJobMatch ? [{ id: 'keywords' as const, label: 'Keywords' }] : []),
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--color-border)' }}>
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

        {tab === 'suggestions' && (
          <span
            className="ml-auto font-mono text-xs rounded-pill border px-2 py-0.5"
            style={{
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-raised)',
            }}
          >
            {feedback.length} items
          </span>
        )}
      </div>

      {/* Suggestions tab */}
      {tab === 'suggestions' && (
        <>
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
            feedback.map((item) => <FeedbackItem key={item.id} item={item} />)
          )}
        </>
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
  )
}
