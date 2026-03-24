'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import type { FeedbackItem } from '@/lib/types'

interface AnnotationDot {
  feedbackId: string
  severity: FeedbackItem['severity']
}

interface ResumeAnnotationPanelProps {
  resumeText: string
  resumeSignedUrl: string | null
  resumeIsPdf: boolean
  feedback: FeedbackItem[]
  keywordsMissing: string[]
  activeFeedbackId: string | null
}

const SECTION_NAMES = new Set([
  'experience', 'education', 'skills', 'summary', 'objective', 'projects',
  'certifications', 'awards', 'publications', 'languages', 'volunteer',
  'work experience', 'professional experience', 'profile', 'about',
  'technical skills', 'achievements', 'interests', 'references',
])

function isSectionHeader(line: string): boolean {
  const t = line.trim()
  if (!t || t.length < 2) return false
  if (t === t.toUpperCase() && t.length < 50 && /[A-Z]/.test(t)) return true
  return SECTION_NAMES.has(t.toLowerCase())
}

function highlightKeywords(
  line: string,
  missingKeywords: string[],
): Array<{ text: string; isKeyword: boolean }> {
  if (missingKeywords.length === 0) return [{ text: line, isKeyword: false }]

  const escaped = missingKeywords.map((kw) =>
    kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  )
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')

  const parts: Array<{ text: string; isKeyword: boolean }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), isKeyword: false })
    }
    parts.push({ text: match[0], isKeyword: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < line.length) {
    parts.push({ text: line.slice(lastIndex), isKeyword: false })
  }

  return parts.length > 0 ? parts : [{ text: line, isKeyword: false }]
}

const SEVERITY_DOT_COLOR: Record<FeedbackItem['severity'], string> = {
  high: 'var(--color-danger)',
  medium: 'var(--color-warning)',
  low: 'var(--color-accent)',
}

export function ResumeAnnotationPanel({
  resumeText,
  resumeSignedUrl,
  resumeIsPdf,
  feedback,
  keywordsMissing,
  activeFeedbackId,
}: ResumeAnnotationPanelProps) {
  const canPreview = resumeIsPdf && !!resumeSignedUrl
  const [subMode, setSubMode] = useState<'annotated' | 'preview'>('annotated')

  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  const lines = useMemo(() => resumeText.split('\n'), [resumeText])

  const lineAnnotations = useMemo(() => {
    const map = new Map<number, AnnotationDot[]>()
    feedback.forEach((item) => {
      if (!item.original_line) return
      const idx = lines.findIndex((l) => l.includes(item.original_line!))
      if (idx === -1) return
      const existing = map.get(idx) ?? []
      existing.push({ feedbackId: item.id, severity: item.severity })
      map.set(idx, existing)
    })
    return map
  }, [feedback, lines])

  const activeLineIndex = useMemo(() => {
    if (!activeFeedbackId) return -1
    const item = feedback.find((f) => f.id === activeFeedbackId)
    if (!item?.original_line) return -1
    return lines.findIndex((l) => l.includes(item.original_line!))
  }, [activeFeedbackId, feedback, lines])

  // Switch to annotated view automatically when a suggestion is selected
  useEffect(() => {
    if (activeFeedbackId) setSubMode('annotated')
  }, [activeFeedbackId])

  // Scroll to active line
  useEffect(() => {
    if (activeLineIndex === -1) return
    const el = lineRefs.current[activeLineIndex]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Re-trigger the CSS animation by resetting it
    el.style.animation = 'none'
    el.getBoundingClientRect() // force reflow
    el.style.animation = 'line-pulse 1.5s ease-out forwards'
  }, [activeLineIndex])

  const hasAnyAnnotation = lineAnnotations.size > 0 || keywordsMissing.length > 0

  return (
    <>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0"
        style={{ borderBottom: '0.5px solid var(--color-border)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Submitted resume
        </p>

        <div className="flex items-center gap-2">
          {hasAnyAnnotation && subMode === 'annotated' && (
            <div className="flex items-center gap-1.5">
              {lineAnnotations.size > 0 && (
                <span
                  className="font-mono text-xs rounded-pill border px-2 py-0.5"
                  style={{
                    color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-raised)',
                  }}
                >
                  {lineAnnotations.size} annotation{lineAnnotations.size !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {canPreview && (
            <div
              className="flex rounded-element border p-0.5 gap-0.5"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
            >
              {(['annotated', 'preview'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSubMode(m)}
                  className="rounded-[5px] px-2.5 py-1 font-mono text-xs transition-colors"
                  style={
                    subMode === m
                      ? { background: 'var(--color-bg-hover)', color: 'var(--color-text-primary)' }
                      : { background: 'transparent', color: 'var(--color-text-tertiary)' }
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {resumeSignedUrl && (
            <a
              href={resumeSignedUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs transition-colors"
              style={{ color: 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
            >
              open ↗
            </a>
          )}
        </div>
      </div>

      {/* Panel body */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {subMode === 'preview' && canPreview ? (
          <iframe
            src={`${resumeSignedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title="Submitted resume PDF"
            className="w-full h-full block"
          />
        ) : (
          <div className="h-full overflow-y-auto px-4 py-3">
            {/* Legend */}
            {hasAnyAnnotation && (
              <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '0.5px solid var(--color-border)' }}>
                <span className="font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  annotations:
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-danger)' }} />
                  high priority
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-warning)' }} />
                  medium
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                  low
                </span>
                {keywordsMissing.length > 0 && (
                  <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span
                      className="inline-block font-mono text-[9px] px-1 rounded-sm"
                      style={{ borderBottom: '1.5px solid var(--color-danger)', color: 'var(--color-danger)' }}
                    >
                      kw
                    </span>
                    missing keyword
                  </span>
                )}
              </div>
            )}

            {/* Lines */}
            <div className="flex flex-col">
              {lines.map((line, idx) => {
                const dots = lineAnnotations.get(idx) ?? []
                const isActive = idx === activeLineIndex
                const isHeader = isSectionHeader(line)
                const isEmpty = line.trim() === ''
                const segments =
                  !isEmpty && keywordsMissing.length > 0
                    ? highlightKeywords(line, keywordsMissing)
                    : null

                return (
                  <div
                    key={idx}
                    ref={(el) => { lineRefs.current[idx] = el }}
                    className="flex items-start gap-2 rounded-[4px] px-1 py-0.5 transition-colors"
                    style={{
                      minHeight: isEmpty ? '0.75rem' : undefined,
                      borderLeft: isActive
                        ? '2px solid var(--color-accent)'
                        : '2px solid transparent',
                    }}
                  >
                    {/* Annotation dots column */}
                    <div className="flex flex-col items-center gap-0.5 pt-[3px] shrink-0" style={{ width: 12 }}>
                      {dots.map((dot) => (
                        <span
                          key={dot.feedbackId}
                          className="block rounded-full shrink-0"
                          style={{
                            width: 6,
                            height: 6,
                            background: SEVERITY_DOT_COLOR[dot.severity],
                          }}
                        />
                      ))}
                    </div>

                    {/* Line text */}
                    <p
                      className={[
                        'flex-1 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap',
                        isHeader ? 'font-medium' : '',
                      ].join(' ')}
                      style={{
                        color: isHeader
                          ? 'var(--color-text-primary)'
                          : isEmpty
                          ? 'transparent'
                          : 'var(--color-text-secondary)',
                      }}
                    >
                      {segments
                        ? segments.map((seg, si) =>
                            seg.isKeyword ? (
                              <span
                                key={si}
                                title="Missing keyword"
                                style={{
                                  color: 'var(--color-danger)',
                                  borderBottom: '1px solid var(--color-danger)',
                                  paddingBottom: 1,
                                  opacity: 0.9,
                                }}
                              >
                                {seg.text}
                              </span>
                            ) : (
                              <span key={si}>{seg.text}</span>
                            ),
                          )
                        : (line || '\u00a0')}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
