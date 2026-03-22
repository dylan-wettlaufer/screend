'use client'

import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
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

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ScoreRing({ score }: ScoreRingProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const clampedScore = Math.max(0, Math.min(100, score))
  const offset = animated
    ? CIRCUMFERENCE - (clampedScore / 100) * CIRCUMFERENCE
    : CIRCUMFERENCE

  const color = getColor(clampedScore)
  const verdict = getVerdict(clampedScore)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          aria-label={`Overall score: ${clampedScore} out of 100`}
          role="img"
        >
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke="var(--color-bg-raised)"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Score label centered inside ring */}
        <div className="absolute flex flex-col items-center leading-none">
          <span
            className="font-mono text-3xl font-medium"
            style={{ color }}
          >
            {clampedScore}
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            / 100
          </span>
        </div>
      </div>

      <span
        className="font-mono text-xs tracking-wide"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {verdict}
      </span>
    </div>
  )
}
