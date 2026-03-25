'use client'

import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  /** Smaller ring + typography for dense layouts (e.g. scan result header) */
  compact?: boolean
}

function getColor(score: number): string {
  if (score >= 75) return '#639922'
  if (score >= 50) return '#EF9F27'
  return '#E24B4A'
}

function getVerdict(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Strong'
  if (score >= 50) return 'Needs improvement'
  return 'Needs major work'
}

const DEFAULT_RADIUS = 54
const COMPACT_RADIUS = 38

export function ScoreRing({ score, compact = false }: ScoreRingProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const radius = compact ? COMPACT_RADIUS : DEFAULT_RADIUS
  const circumference = 2 * Math.PI * radius
  const strokeW = compact ? 7 : 10
  const size = compact ? 100 : 140
  const c = size / 2

  const clampedScore = Math.max(0, Math.min(100, score))
  const offset = animated
    ? circumference - (clampedScore / 100) * circumference
    : circumference

  const color = getColor(clampedScore)
  const verdict = getVerdict(clampedScore)

  return (
    <div className={`flex flex-col items-center ${compact ? 'gap-1' : 'gap-3'}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label={`Overall score: ${clampedScore} out of 100`}
          role="img"
        >
          <circle
            cx={c}
            cy={c}
            r={radius}
            fill="none"
            stroke="var(--color-bg-raised)"
            strokeWidth={strokeW}
          />
          <circle
            cx={c}
            cy={c}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${c} ${c})`}
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center leading-none">
          <span
            className={`font-mono font-medium ${compact ? 'text-xl' : 'text-3xl'}`}
            style={{ color }}
          >
            {clampedScore}
          </span>
          <span
            className={`font-mono ${compact ? 'text-[10px]' : 'text-xs'}`}
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            / 100
          </span>
        </div>
      </div>

      <span
        className={`font-mono tracking-wide ${compact ? 'text-[10px] leading-tight text-center px-1' : 'text-xs'}`}
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {verdict}
      </span>
    </div>
  )
}
