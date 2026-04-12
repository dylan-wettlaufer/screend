'use client'

import { useEffect, useState } from 'react'

interface SubScoreBarProps {
  label: string
  score: number
  max?: number
  compact?: boolean
  /** Tighter row for condensed score strip */
  dense?: boolean
}

function getColor(score: number, max: number): string {
  const pct = (score / max) * 100
  if (pct >= 75) return 'var(--color-metric-positive)'
  if (pct >= 50) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

export function SubScoreBar({
  label,
  score,
  max = 20,
  compact = false,
  dense = false,
}: SubScoreBarProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const clampedScore = Math.max(0, Math.min(max, score))
  const pct = animated ? (clampedScore / max) * 100 : 0
  const color = getColor(clampedScore, max)

  const gapClass = dense ? 'gap-0.5' : compact ? 'gap-1' : 'gap-1.5'
  const labelClass = dense
    ? 'text-[10px] leading-tight line-clamp-2'
    : compact
      ? 'text-[11px] leading-tight'
      : 'text-xs'
  const valueClass = dense ? 'text-[10px]' : compact ? 'text-[11px]' : 'text-xs'
  const barH = dense ? 'h-0.5' : compact ? 'h-1' : 'h-1.5'

  return (
    <div className={`flex flex-col ${gapClass}`}>
      <div className="flex items-start justify-between gap-1.5 min-w-0">
        <span className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
        <span className={`font-mono shrink-0 ${valueClass}`} style={{ color: 'var(--color-text-primary)' }}>
          {clampedScore}
          <span style={{ color: 'var(--color-text-tertiary)' }}>/{max}</span>
        </span>
      </div>
      <div
        className={`${barH} w-full rounded-pill overflow-hidden border`}
        style={{
          background: 'var(--color-bg-base)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="h-full rounded-pill"
          style={{
            width: `${pct}%`,
            background: color,
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  )
}
