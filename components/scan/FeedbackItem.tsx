'use client'

import { useState } from 'react'
import type { FeedbackItem as FeedbackItemType } from '@/lib/types'

interface FeedbackItemProps {
  item: FeedbackItemType
}

const severityStyles: Record<FeedbackItemType['severity'], { dot: string; label: string }> = {
  high: { dot: 'var(--color-danger)', label: 'High' },
  medium: { dot: '#EF9F27', label: 'Medium' },
  low: { dot: 'var(--color-success)', label: 'Low' },
}

const DESCRIPTION_THRESHOLD = 120

export function FeedbackItem({ item }: FeedbackItemProps) {
  const { dot, label: severityLabel } = severityStyles[item.severity]
  const hasDiff = !!(item.original_line && item.suggested_line)
  const isLong = item.description.length > DESCRIPTION_THRESHOLD

  const [expanded, setExpanded] = useState(false)

  const visibleDescription =
    isLong && !expanded
      ? item.description.slice(0, DESCRIPTION_THRESHOLD).trimEnd() + '…'
      : item.description

  return (
    <div
      className="rounded-card border p-4 flex flex-col gap-3"
      style={{
        background: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-2.5">
        <div className="mt-1 shrink-0">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: dot }}
            aria-label={`Severity: ${severityLabel}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="font-mono text-xs rounded-pill px-2 py-0.5 border"
              style={{
                color: 'var(--color-text-secondary)',
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-raised)',
              }}
            >
              {item.section}
            </span>
          </div>
          <p
            className="text-sm font-medium leading-snug"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {item.title}
          </p>
        </div>
      </div>

      {/* Description + read more */}
      <div className="flex flex-col gap-1.5">
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {visibleDescription}
        </p>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="self-start font-mono text-xs transition-colors"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
          >
            {expanded ? 'show less' : 'read more'}
          </button>
        )}
      </div>

      {/* Before / after mini-diff — always visible */}
      {hasDiff && (
        <div
          className="flex flex-col gap-1.5 rounded-element overflow-hidden border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="px-3 py-2 flex gap-2 items-start" style={{ background: '#2a1515' }}>
            <span
              className="font-mono text-xs shrink-0 mt-0.5"
              style={{ color: 'var(--color-danger)' }}
            >
              −
            </span>
            <p
              className="font-mono text-xs leading-relaxed line-through"
              style={{ color: '#e07070' }}
            >
              {item.original_line}
            </p>
          </div>
          <div className="px-3 py-2 flex gap-2 items-start" style={{ background: '#152a1e' }}>
            <span
              className="font-mono text-xs shrink-0 mt-0.5"
              style={{ color: 'var(--color-success)' }}
            >
              +
            </span>
            <p className="font-mono text-xs leading-relaxed" style={{ color: '#70e0a0' }}>
              {item.suggested_line}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
