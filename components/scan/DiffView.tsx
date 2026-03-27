'use client'

import { useState } from 'react'
import type { RewriteDiffItem } from '@/lib/types'

interface DiffViewProps {
  diff: RewriteDiffItem[]
  onDownloadPdf: (acceptedDiff: RewriteDiffItem[]) => void
  onDownloadDocx: (acceptedDiff: RewriteDiffItem[]) => void
  isDownloadingPdf?: boolean
  downloadPdfError?: string | null
  isDownloadingDocx?: boolean
  downloadDocxError?: string | null
}

export function DiffView({
  diff,
  onDownloadPdf,
  onDownloadDocx,
  isDownloadingPdf = false,
  downloadPdfError = null,
  isDownloadingDocx = false,
  downloadDocxError = null,
}: DiffViewProps) {
  const [unaccepted, setUnaccepted] = useState<Set<number>>(new Set())

  function toggleChange(index: number) {
    setUnaccepted((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const acceptedDiff = diff.filter((_, i) => !unaccepted.has(i))
  const acceptedCount = acceptedDiff.length

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Updated resume
        </p>
        <span
          className="font-mono text-xs rounded-pill border px-2 py-0.5"
          style={{
            color: acceptedCount > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            borderColor: acceptedCount > 0 ? 'var(--color-accent-dim)' : 'var(--color-border)',
            background: acceptedCount > 0 ? 'var(--color-accent-muted)' : 'var(--color-bg-raised)',
          }}
        >
          {acceptedCount} / {diff.length} changes applied
        </span>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-2 gap-3">
        <p
          className="font-mono text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Original
        </p>
        <p
          className="font-mono text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Revised
        </p>
      </div>

      {/* Diff cards */}
      {diff.map((item, index) => {
        const isUnaccepted = unaccepted.has(index)
        return (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-card border p-4 transition-colors"
            style={{
              background: isUnaccepted ? 'var(--color-bg-surface)' : 'var(--color-bg-surface)',
              borderColor: isUnaccepted ? 'var(--color-border)' : 'var(--color-accent-dim)',
              opacity: isUnaccepted ? 0.5 : 1,
            }}
          >
            {/* Section label + toggle */}
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-xs rounded-pill border px-2 py-0.5"
                style={{
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-raised)',
                }}
              >
                {item.section}
              </span>
              <button
                type="button"
                onClick={() => toggleChange(index)}
                className="font-mono text-xs transition-colors"
                style={{ color: isUnaccepted ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = isUnaccepted
                    ? 'var(--color-accent)'
                    : 'var(--color-danger)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isUnaccepted
                    ? 'var(--color-accent)'
                    : 'var(--color-text-tertiary)')
                }
              >
                {isUnaccepted ? 'restore' : 'remove'}
              </button>
            </div>

            {/* Side-by-side lines */}
            <div className="grid grid-cols-2 gap-3">
              {/* Original */}
              <div
                className="rounded-element px-3 py-2.5"
                style={{ background: '#2a1515' }}
              >
                <p
                  className="font-mono text-xs leading-relaxed line-through"
                  style={{ color: '#e07070' }}
                >
                  {item.original_line}
                </p>
              </div>

              {/* Revised */}
              <div
                className="rounded-element px-3 py-2.5"
                style={{ background: isUnaccepted ? '#2a1515' : '#152a1e' }}
              >
                <p
                  className={`font-mono text-xs leading-relaxed ${isUnaccepted ? 'line-through' : ''}`}
                  style={{ color: isUnaccepted ? '#e07070' : '#70e0a0' }}
                >
                  {item.revised_line}
                </p>
              </div>
            </div>
          </div>
        )
      })}

      {/* Error messages */}
      {downloadPdfError && (
        <p className="font-mono text-xs" style={{ color: 'var(--color-danger)' }}>
          {downloadPdfError}
        </p>
      )}
      {downloadDocxError && (
        <p className="font-mono text-xs" style={{ color: 'var(--color-danger)' }}>
          {downloadDocxError}
        </p>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          disabled={acceptedCount === 0 || isDownloadingPdf}
          onClick={() => onDownloadPdf(acceptedDiff)}
          className="flex-1 rounded-element border py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg-raised)',
          }}
        >
          {isDownloadingPdf ? 'Generating PDF…' : 'Download PDF'}
        </button>
        <button
          type="button"
          disabled={acceptedCount === 0 || isDownloadingDocx}
          onClick={() => onDownloadDocx(acceptedDiff)}
          className="flex-1 rounded-element border py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg-raised)',
          }}
        >
          {isDownloadingDocx ? 'Generating DOCX…' : 'Download DOCX'}
        </button>
      </div>
    </div>
  )
}
