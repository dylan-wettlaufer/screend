'use client'

import { useRef, useEffect, useMemo } from 'react'
import { PdfAnnotationViewer } from '@/components/scan/PdfAnnotationViewer'
import { ResumeStructuredEditor } from '@/components/scan/ResumeStructuredEditor'
import { JakesResumePreview } from '@/components/scan/jakesResumePreview/JakesResumePreview'
import type { FeedbackItem, StructuredResume } from '@/lib/types'

export type WorkbenchTab = 'submitted' | 'editor' | 'preview'

interface ResumeAnnotationPanelProps {
  resumeText: string
  resumeSignedUrl: string | null
  resumeIsPdf: boolean
  feedback: FeedbackItem[]
  keywordsMissing: string[]
  activeFeedbackId: string | null
  structuredResume: StructuredResume | null
  /** Reserved for a future loading state when structured resume is fetched async */
  isBootstrappingStructure?: boolean
  workbenchTab: WorkbenchTab
  onWorkbenchTabChange: (tab: WorkbenchTab) => void
  onStructuredResumeChange: (next: StructuredResume) => void
}

// ── Text-fallback helpers (used when no PDF is available) ──────────────────

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
    if (match.index > lastIndex)
      parts.push({ text: line.slice(lastIndex, match.index), isKeyword: false })
    parts.push({ text: match[0], isKeyword: true })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < line.length)
    parts.push({ text: line.slice(lastIndex), isKeyword: false })
  return parts.length > 0 ? parts : [{ text: line, isKeyword: false }]
}

const SEVERITY_DOT_COLOR: Record<FeedbackItem['severity'], string> = {
  high: 'var(--color-danger)',
  medium: 'var(--color-warning)',
  low: 'var(--color-accent)',
}

// ── Main component ─────────────────────────────────────────────────────────

function WorkbenchTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-pill px-3 py-1 text-xs font-medium transition-colors"
      style={
        active
          ? {
              background: 'var(--color-bg-hover)',
              color: 'var(--color-text-primary)',
              border: '0.5px solid var(--color-border-strong)',
            }
          : {
              background: 'transparent',
              color: 'var(--color-text-tertiary)',
              border: '0.5px solid transparent',
            }
      }
    >
      {label}
    </button>
  )
}

export function ResumeAnnotationPanel({
  resumeText,
  resumeSignedUrl,
  resumeIsPdf,
  feedback,
  keywordsMissing,
  activeFeedbackId,
  structuredResume,
  isBootstrappingStructure = false,
  workbenchTab,
  onWorkbenchTabChange,
  onStructuredResumeChange,
}: ResumeAnnotationPanelProps) {
  const isPdfMode = resumeIsPdf && !!resumeSignedUrl
  const showWorkbench = structuredResume !== null
  const showWorkbenchChrome = showWorkbench || isBootstrappingStructure

  return (
    <>
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0 gap-2 flex-wrap"
        style={{ borderBottom: '0.5px solid var(--color-border)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {showWorkbenchChrome ? 'Resume workbench' : 'Submitted resume'}
        </p>
        <div className="flex items-center gap-2">
          {showWorkbench && (
            <div
              className="flex items-center gap-0.5 rounded-element border p-0.5 flex-wrap"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
            >
              <WorkbenchTabButton
                active={workbenchTab === 'submitted'}
                label="Submitted"
                onClick={() => onWorkbenchTabChange('submitted')}
              />
              <WorkbenchTabButton
                active={workbenchTab === 'editor'}
                label="Editor"
                onClick={() => onWorkbenchTabChange('editor')}
              />
              <WorkbenchTabButton
                active={workbenchTab === 'preview'}
                label="Preview"
                onClick={() => onWorkbenchTabChange('preview')}
              />
            </div>
          )}
          {resumeSignedUrl && (
            <a
              href={resumeSignedUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs transition-colors"
              style={{ color: 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--color-text-secondary)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--color-text-tertiary)')
              }
            >
              open ↗
            </a>
          )}
        </div>
      </div>

      {/* Panel body */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isBootstrappingStructure && structuredResume === null ? (
          <div
            className="h-full min-h-0 flex flex-col items-center justify-center gap-2 px-6 py-8"
            aria-busy="true"
            aria-live="polite"
          >
            <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Parsing resume into the editor…
            </p>
            <p className="font-mono text-xs text-center max-w-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              This usually takes a few seconds.
            </p>
          </div>
        ) : showWorkbench && workbenchTab === 'submitted' ? (
          isPdfMode ? (
            <PdfAnnotationViewer url={resumeSignedUrl!} />
          ) : (
            <div className="h-full min-h-0 overflow-y-auto">
              <TextAnnotationView
                resumeText={resumeText}
                feedback={feedback}
                keywordsMissing={keywordsMissing}
                activeFeedbackId={activeFeedbackId}
              />
            </div>
          )
        ) : showWorkbench ? (
          <div className="h-full min-h-0 overflow-y-auto px-4 py-3">
            {workbenchTab === 'editor' ? (
              <ResumeStructuredEditor
                value={structuredResume!}
                onChange={onStructuredResumeChange}
              />
            ) : (
              <JakesResumePreview resume={structuredResume!} />
            )}
          </div>
        ) : isPdfMode ? (
          <PdfAnnotationViewer url={resumeSignedUrl!} />
        ) : (
          <TextAnnotationView
            resumeText={resumeText}
            feedback={feedback}
            keywordsMissing={keywordsMissing}
            activeFeedbackId={activeFeedbackId}
          />
        )}
      </div>
    </>
  )
}

// ── Text annotation view (fallback for paste-text resumes) ─────────────────

interface TextAnnotationViewProps {
  resumeText: string
  feedback: FeedbackItem[]
  keywordsMissing: string[]
  activeFeedbackId: string | null
}

function TextAnnotationView({
  resumeText,
  feedback,
  keywordsMissing,
  activeFeedbackId,
}: TextAnnotationViewProps) {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const lines = useMemo(() => resumeText.split('\n'), [resumeText])

  const lineAnnotations = useMemo(() => {
    const map = new Map<number, Array<{ feedbackId: string; severity: FeedbackItem['severity'] }>>()
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

  useEffect(() => {
    if (activeLineIndex === -1) return
    const el = lineRefs.current[activeLineIndex]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.style.animation = 'none'
    el.getBoundingClientRect()
    el.style.animation = 'line-pulse 1.5s ease-out forwards'
  }, [activeLineIndex])

  const hasAnnotations = lineAnnotations.size > 0 || keywordsMissing.length > 0

  return (
    <div className="h-full overflow-y-auto px-4 py-3">
      {hasAnnotations && (
        <div
          className="flex items-center gap-3 mb-4 pb-3"
          style={{ borderBottom: '0.5px solid var(--color-border)' }}
        >
          <span className="font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            annotations:
          </span>
          {(['high', 'medium', 'low'] as const).map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 font-mono text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: SEVERITY_DOT_COLOR[s] }}
              />
              {s}
            </span>
          ))}
          {keywordsMissing.length > 0 && (
            <span
              className="flex items-center gap-1.5 font-mono text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <span
                className="inline-block font-mono text-[9px] px-1"
                style={{
                  borderBottom: '1.5px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                }}
              >
                kw
              </span>
              missing keyword
            </span>
          )}
        </div>
      )}

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
              ref={(el) => {
                lineRefs.current[idx] = el
              }}
              className="flex items-start gap-2 rounded-[4px] px-1 py-0.5"
              style={{
                minHeight: isEmpty ? '0.75rem' : undefined,
                borderLeft: isActive
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
              }}
            >
              {/* Severity dots */}
              <div
                className="flex flex-col items-center gap-0.5 pt-[3px] shrink-0"
                style={{ width: 12 }}
              >
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

              {/* Text */}
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
                  : line || '\u00a0'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
