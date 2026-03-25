'use client'

import { useEffect, useState } from 'react'

interface SubScoreBarProps {
  label: string
  score: number
  max?: number
  compact?: boolean
}

function getColor(score: number, max: number): string {
  const pct = (score / max) * 100
  if (pct >= 75) return '#639922'
  if (pct >= 50) return '#EF9F27'
  return '#E24B4A'
}

export function SubScoreBar({ label, score, max = 20, compact = false }: SubScoreBarProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const clampedScore = Math.max(0, Math.min(max, score))
  const pct = animated ? (clampedScore / max) * 100 : 0
  const color = getColor(clampedScore, max)

  return (
    <div className={`flex flex-col ${compact ? 'gap-0.5' : 'gap-1.5'}`}>
      <div className="flex items-center justify-between gap-2">
        <span
          className={compact ? 'text-[11px] leading-tight' : 'text-xs'}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </span>
        <span
          className={`font-mono ${compact ? 'text-[11px]' : 'text-xs'}`}
          style={{ color: 'var(--color-text-primary)' }}
        >
          {clampedScore}
          <span style={{ color: 'var(--color-text-tertiary)' }}>/{max}</span>
        </span>
      </div>
      <div
        className={`${compact ? 'h-1' : 'h-1.5'} w-full rounded-pill overflow-hidden`}
        style={{ background: 'var(--color-bg-raised)' }}
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
