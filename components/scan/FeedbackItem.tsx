'use client'

import { useState } from 'react'
import type { FeedbackItem as FeedbackItemType } from '@/lib/types'

interface FeedbackItemProps {
  item: FeedbackItemType
  isAccepted: boolean
  isDismissed: boolean
  isActive: boolean
  onAccept: () => void
  onDismiss: () => void
  onSelect: () => void
}

const severityStyles: Record<FeedbackItemType['severity'], { dot: string; label: string }> = {
  high: { dot: 'var(--color-danger)', label: 'High' },
  medium: { dot: '#EF9F27', label: 'Medium' },
  low: { dot: 'var(--color-success)', label: 'Low' },
}

const DESCRIPTION_THRESHOLD = 120

export function FeedbackItem({ item, isAccepted, isDismissed, isActive, onAccept, onDismiss, onSelect }: FeedbackItemProps) {
  const { dot, label: severityLabel } = severityStyles[item.severity]
  const hasDiff = !!(item.original_line && item.suggested_line)
  const isLong = item.description.length > DESCRIPTION_THRESHOLD

  const [expanded, setExpanded] = useState(false)

  const visibleDescription =
    isLong && !expanded
      ? item.description.slice(0, DESCRIPTION_THRESHOLD).trimEnd() + '…'
      : item.description

  // Dismissed state — collapsed single row
  if (isDismissed) {
    return (
      <div
        className="rounded-card border px-4 py-3 flex items-center gap-2.5"
        style={{
          background: 'var(--color-bg-surface)',
          borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
        }}
      >
        <div className="shrink-0 h-2 w-2 rounded-full opacity-30" style={{ background: dot }} />
        <p
          className="flex-1 text-sm line-through truncate"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {item.title}
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDismiss() }}
          className="shrink-0 font-mono text-xs transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
        >
          undo
        </button>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className="rounded-card border p-4 flex flex-col gap-3 transition-colors cursor-pointer outline-none"
        style={{
          background: 'var(--color-bg-surface)',
          borderColor: isActive
            ? 'var(--color-accent)'
            : isAccepted
            ? 'var(--color-border-strong)'
            : 'var(--color-border)',
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
                borderColor: isAccepted ? 'var(--color-accent-dim)' : 'var(--color-border)',
                background: isAccepted ? 'transparent' : 'var(--color-bg-raised)',
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
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
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
          style={{ borderColor: isAccepted ? 'var(--color-accent-dim)' : 'var(--color-border)' }}
        >
          <div className="px-3 py-2 flex gap-2 items-start" style={{ background: '#2a1515' }}>
            <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: 'var(--color-danger)' }}>
              −
            </span>
            <p className="font-mono text-xs leading-relaxed line-through" style={{ color: '#e07070' }}>
              {item.original_line}
            </p>
          </div>
          <div className="px-3 py-2 flex gap-2 items-start" style={{ background: '#152a1e' }}>
            <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }}>
              +
            </span>
            <p className="font-mono text-xs leading-relaxed" style={{ color: '#70e0a0' }}>
              {item.suggested_line}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        {isAccepted ? (
          <span
            className="flex items-center gap-1.5 font-mono text-xs"
            style={{ color: 'var(--color-accent)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            accepted
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAccept() }}
              className="rounded-element border px-3 py-1 font-mono text-xs transition-colors"
              style={{
                borderColor: 'var(--color-accent-dim)',
                color: 'var(--color-accent)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Accept
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDismiss() }}
              className="rounded-element border px-3 py-1 font-mono text-xs transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5a2020'
                e.currentTarget.style.color = 'var(--color-danger)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  )
}
