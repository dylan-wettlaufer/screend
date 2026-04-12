'use client'

import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { AlertCircle, Check, CheckCircle2, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import {
  SECTION_DIAGNOSTIC_KEYS,
  SECTION_DIAGNOSTIC_LABELS,
  type FeedbackItem as FeedbackItemType,
  type SectionDiagnostics,
  type SectionImprovement,
  type SectionDiagnosticKey,
} from '@/lib/types'

const JD_SKY = '#0ea5e9'
const JD_INDIGO = '#6366f1'
const JD_FG = '#f8fafc'
const JD_MUTED = '#94a3b8'

export type AuditSectionKey = SectionDiagnosticKey

const LEGACY_SECTIONS: { key: AuditSectionKey; label: string }[] = SECTION_DIAGNOSTIC_KEYS.map((key) => ({
  key,
  label: SECTION_DIAGNOSTIC_LABELS[key],
}))

function mapSectionLabelToKey(section: string): AuditSectionKey {
  const s = section.trim().toLowerCase()
  if (s.includes('project')) return 'projects'
  if (s.includes('skill') || s.includes('certif')) return 'skills'
  if (
    s.includes('education') ||
    s.includes('academic') ||
    s.includes('university') ||
    s.includes('degree')
  ) {
    return 'education'
  }
  if (
    s.includes('header') ||
    s.includes('contact') ||
    (s.includes('summary') && !s.includes('experience'))
  ) {
    return 'header'
  }
  if (
    s.includes('experience') ||
    s.includes('employment') ||
    s.includes('work') ||
    s.includes('intern')
  ) {
    return 'experience'
  }
  return 'experience'
}

function groupFeedbackBySection(feedback: FeedbackItemType[]): Record<AuditSectionKey, FeedbackItemType[]> {
  const buckets: Record<AuditSectionKey, FeedbackItemType[]> = {
    header: [],
    experience: [],
    projects: [],
    skills: [],
    education: [],
  }
  for (const item of feedback) {
    buckets[mapSectionLabelToKey(item.section)].push(item)
  }
  return buckets
}

function sectionSeveritySummary(items: FeedbackItemType[]) {
  let high = 0
  let medium = 0
  let low = 0
  for (const i of items) {
    if (i.severity === 'high') high += 1
    else if (i.severity === 'medium') medium += 1
    else low += 1
  }
  const worst: 'high' | 'medium' | 'low' | null =
    high > 0 ? 'high' : medium > 0 ? 'medium' : low > 0 ? 'low' : null
  return { high, medium, low, worst }
}

export interface ResumeAuditSidebarProps {
  feedback: FeedbackItemType[]
  sectionDiagnostics: SectionDiagnostics | null
  accepted: Set<string>
  dismissed: Set<string>
  activeFeedbackId: string | null
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
  onFeedbackSelect: (id: string | null) => void
  accordionMultiple?: boolean
  /** Job match: JD Alignment Engine copy, rail filter, theme */
  isJobMatch?: boolean
  selectedSection?: SectionDiagnosticKey | null
  onSectionSelect?: (key: SectionDiagnosticKey | null) => void
}

function severityDotClass(severity: FeedbackItemType['severity']): string {
  switch (severity) {
    case 'high':
      return 'var(--color-danger)'
    case 'medium':
      return 'var(--color-warning)'
    case 'low':
      return 'var(--color-success)'
    default:
      return 'var(--color-text-tertiary)'
  }
}

function LineDiffViewer({
  originalLine,
  suggestedLine,
  isAccepted,
  jdTheme,
}: {
  originalLine: string | null
  suggestedLine: string
  isAccepted: boolean
  jdTheme?: boolean
}) {
  const border = jdTheme
    ? isAccepted
      ? 'rgba(14, 165, 233, 0.45)'
      : 'rgba(14, 165, 233, 0.22)'
    : isAccepted
      ? 'var(--color-accent-dim)'
      : 'var(--color-border)'
  const beforeBg = jdTheme ? 'rgba(15, 23, 42, 0.9)' : 'var(--color-bg-hover)'
  const afterBg = jdTheme ? 'rgba(14, 165, 233, 0.08)' : 'var(--color-accent-muted)'
  const del = jdTheme ? '#f87171' : 'var(--color-danger)'
  const add = jdTheme ? JD_SKY : 'var(--color-accent)'
  const hasOrig = !!(originalLine && originalLine.trim())

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-0 rounded-element overflow-hidden border font-mono text-xs leading-relaxed"
      style={{ borderColor: border }}
    >
      {hasOrig ? (
        <div
          className="px-3 py-2.5 flex flex-col gap-1 border-b sm:border-b-0 sm:border-r"
          style={{
            background: beforeBg,
            borderColor: jdTheme ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-border)',
          }}
        >
          <span className="text-[10px] tracking-wide" style={{ color: jdTheme ? JD_MUTED : 'var(--color-text-tertiary)' }}>
            Before
          </span>
          <p className="line-through" style={{ color: del }}>
            {originalLine}
          </p>
        </div>
      ) : null}
      <div
        className={cn('px-3 py-2.5 flex flex-col gap-1', !hasOrig && 'sm:col-span-2')}
        style={{ background: afterBg }}
      >
        <span className="text-[10px] tracking-wide" style={{ color: jdTheme ? JD_MUTED : 'var(--color-text-tertiary)' }}>
          After
        </span>
        <p style={{ color: add }}>{suggestedLine}</p>
      </div>
    </div>
  )
}

function BridgeGapToggle({
  reasoningText,
  descriptionText,
  open,
  onToggle,
  stopCardClick,
  jdTheme,
}: {
  reasoningText: string
  descriptionText: string
  open: boolean
  onToggle: () => void
  stopCardClick: (e: MouseEvent | KeyboardEvent) => void
  jdTheme?: boolean
}) {
  if (!reasoningText.trim() && !descriptionText.trim()) return null
  const labelColor = jdTheme ? JD_MUTED : 'var(--color-text-tertiary)'
  const bodyColor = jdTheme ? '#cbd5e1' : 'var(--color-text-secondary)'
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={(e) => {
          stopCardClick(e)
          onToggle()
        }}
        className="flex items-center gap-1.5 text-left font-mono text-xs outline-none rounded-element py-1 -my-1 w-fit"
        style={{ color: labelColor }}
        aria-expanded={open}
      >
        <ChevronDown
          className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
        Why this bridges the gap
      </button>
      {open ? (
        <div className="text-sm leading-relaxed pl-5 flex flex-col gap-2 border-l" style={{ borderColor: jdTheme ? 'rgba(14, 165, 233, 0.25)' : 'var(--color-border)' }}>
          {descriptionText.trim() ? (
            <p style={{ color: bodyColor }}>{descriptionText}</p>
          ) : null}
          {reasoningText.trim() ? (
            <p style={{ color: bodyColor }}>{reasoningText}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function SectionImprovementForgeCard({
  item,
  isAccepted,
  isDismissed,
  isActive,
  onAccept,
  onDismiss,
  onSelect,
  jdTheme,
  acceptLabel,
}: {
  item: SectionImprovement
  isAccepted: boolean
  isDismissed: boolean
  isActive: boolean
  onAccept: () => void
  onDismiss: () => void
  onSelect: () => void
  jdTheme?: boolean
  acceptLabel: string
}) {
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const dot = severityDotClass(item.severity)
  const reasoningText = item.reasoning?.trim() ?? ''
  const suggested = item.suggested_line?.trim() ?? ''
  const alignmentTarget = item.alignment_target?.trim() ?? ''

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
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
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
        background: jdTheme ? 'rgba(15, 23, 42, 0.55)' : 'var(--color-bg-raised)',
        borderColor: jdTheme
          ? isActive
            ? JD_SKY
            : isAccepted
              ? 'rgba(99, 102, 241, 0.35)'
              : 'rgba(14, 165, 233, 0.28)'
          : isActive
            ? 'var(--color-accent)'
            : isAccepted
              ? 'var(--color-border-strong)'
              : 'var(--color-accent-dim)',
        boxShadow: jdTheme ? '0 0 20px rgba(14, 165, 233, 0.06)' : undefined,
      }}
    >
      <p
        className="font-mono text-[10px] tracking-wide"
        style={{ color: jdTheme ? JD_INDIGO : 'var(--color-accent)' }}
      >
        JD bridge
      </p>
      {alignmentTarget ? (
        <p className="font-mono text-[11px] leading-snug" style={{ color: jdTheme ? JD_SKY : 'var(--color-accent)' }}>
          {alignmentTarget}
        </p>
      ) : null}
      <div className="flex items-start gap-2.5">
        <div className="mt-1 shrink-0">
          <div className="h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium leading-snug"
            style={{ color: jdTheme ? JD_FG : 'var(--color-text-primary)' }}
          >
            {item.title}
          </p>
        </div>
      </div>

      <LineDiffViewer
        originalLine={item.original_line}
        suggestedLine={suggested}
        isAccepted={isAccepted}
        jdTheme={jdTheme}
      />

      <BridgeGapToggle
        reasoningText={reasoningText}
        descriptionText={item.description}
        open={reasoningOpen}
        onToggle={() => setReasoningOpen((o) => !o)}
        stopCardClick={(e) => e.stopPropagation()}
        jdTheme={jdTheme}
      />

      <div className="flex items-center gap-2 pt-0.5">
        {isAccepted ? (
          <span
            className="flex items-center gap-1.5 font-mono text-xs"
            style={{ color: jdTheme ? JD_SKY : 'var(--color-accent)' }}
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
            synced
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAccept()
              }}
              className="rounded-element border px-3 py-1 font-mono text-xs transition-colors"
              style={{
                borderColor: jdTheme ? 'rgba(14, 165, 233, 0.45)' : 'var(--color-accent-dim)',
                color: jdTheme ? JD_SKY : 'var(--color-accent)',
                background: jdTheme ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = jdTheme
                  ? 'rgba(14, 165, 233, 0.15)'
                  : 'var(--color-accent-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = jdTheme ? 'rgba(14, 165, 233, 0.08)' : 'transparent'
              }}
            >
              {acceptLabel}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDismiss()
              }}
              className="rounded-element border px-3 py-1 font-mono text-xs transition-colors"
              style={{
                borderColor: jdTheme ? 'rgba(148, 163, 184, 0.25)' : 'var(--color-border)',
                color: jdTheme ? JD_MUTED : 'var(--color-text-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-danger)'
                e.currentTarget.style.color = 'var(--color-danger)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = jdTheme ? 'rgba(148, 163, 184, 0.25)' : 'var(--color-border)'
                e.currentTarget.style.color = jdTheme ? JD_MUTED : 'var(--color-text-secondary)'
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

function SectionImprovementStrategicTipCard({
  item,
  isDismissed,
  isActive,
  onDismiss,
  onSelect,
  jdTheme,
}: {
  item: SectionImprovement
  isDismissed: boolean
  isActive: boolean
  onDismiss: () => void
  onSelect: () => void
  jdTheme?: boolean
}) {
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const dot = severityDotClass(item.severity)
  const reasoningText = item.reasoning?.trim() ?? ''
  const alignmentTarget = item.alignment_target?.trim() ?? ''

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
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
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
        background: jdTheme ? 'rgba(15, 23, 42, 0.45)' : 'var(--color-bg-surface)',
        borderColor: jdTheme
          ? isActive
            ? JD_SKY
            : 'rgba(14, 165, 233, 0.2)'
          : isActive
            ? 'var(--color-accent)'
            : 'var(--color-border)',
        boxShadow: jdTheme ? '0 0 16px rgba(99, 102, 241, 0.05)' : undefined,
      }}
    >
      <p
        className="font-mono text-[10px] tracking-wide"
        style={{ color: jdTheme ? JD_MUTED : 'var(--color-text-secondary)' }}
      >
        {jdTheme ? 'Alignment tip' : 'Strategic tip'}
      </p>
      {alignmentTarget ? (
        <p className="font-mono text-[11px] leading-snug" style={{ color: jdTheme ? JD_SKY : 'var(--color-accent)' }}>
          {alignmentTarget}
        </p>
      ) : null}
      <div className="flex items-start gap-2.5">
        <div className="mt-1 shrink-0">
          <div className="h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium leading-snug"
            style={{ color: jdTheme ? JD_FG : 'var(--color-text-primary)' }}
          >
            {item.title}
          </p>
        </div>
      </div>

      <BridgeGapToggle
        reasoningText={reasoningText}
        descriptionText={item.description}
        open={reasoningOpen}
        onToggle={() => setReasoningOpen((o) => !o)}
        stopCardClick={(e) => e.stopPropagation()}
        jdTheme={jdTheme}
      />

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="rounded-element border px-3 py-1 font-mono text-xs transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-danger)'
            e.currentTarget.style.color = 'var(--color-danger)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

function LegacyAuditFeedbackCard({
  item,
  isAccepted,
  isDismissed,
  isActive,
  onAccept,
  onDismiss,
  onSelect,
  jdTheme,
  acceptLabel,
}: {
  item: FeedbackItemType
  isAccepted: boolean
  isDismissed: boolean
  isActive: boolean
  onAccept: () => void
  onDismiss: () => void
  onSelect: () => void
  jdTheme?: boolean
  acceptLabel: string
}) {
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const dot = severityDotClass(item.severity)
  const hasSuggested = !!(item.suggested_line && item.suggested_line.trim() !== '')
  const reasoningText = item.reasoning?.trim() ?? ''
  const alignmentTarget = item.alignment_target?.trim() ?? ''

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
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
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
        background: jdTheme ? 'rgba(15, 23, 42, 0.45)' : 'var(--color-bg-surface)',
        borderColor: jdTheme
          ? isActive
            ? JD_SKY
            : isAccepted
              ? 'rgba(99, 102, 241, 0.35)'
              : 'rgba(14, 165, 233, 0.2)'
          : isActive
            ? 'var(--color-accent)'
            : isAccepted
              ? 'var(--color-border-strong)'
              : 'var(--color-border)',
      }}
    >
      {alignmentTarget ? (
        <p className="font-mono text-[11px] leading-snug" style={{ color: jdTheme ? JD_SKY : 'var(--color-accent)' }}>
          {alignmentTarget}
        </p>
      ) : null}
      <div className="flex items-start gap-2.5">
        <div className="mt-1 shrink-0">
          <div className="h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium leading-snug"
            style={{ color: jdTheme ? JD_FG : 'var(--color-text-primary)' }}
          >
            {item.title}
          </p>
        </div>
      </div>

      {hasSuggested ? (
        <LineDiffViewer
          originalLine={item.original_line}
          suggestedLine={item.suggested_line ?? ''}
          isAccepted={isAccepted}
          jdTheme={jdTheme}
        />
      ) : null}

      <BridgeGapToggle
        reasoningText={reasoningText}
        descriptionText={item.description}
        open={reasoningOpen}
        onToggle={() => setReasoningOpen((o) => !o)}
        stopCardClick={(e) => e.stopPropagation()}
        jdTheme={jdTheme}
      />

      <div className="flex items-center gap-2 pt-0.5">
        {isAccepted ? (
          <span
            className="flex items-center gap-1.5 font-mono text-xs"
            style={{ color: jdTheme ? JD_SKY : 'var(--color-accent)' }}
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
            {jdTheme ? 'synced' : 'accepted'}
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAccept()
              }}
              className="rounded-element border px-3 py-1 font-mono text-xs transition-colors"
              style={{
                borderColor: jdTheme ? 'rgba(14, 165, 233, 0.45)' : 'var(--color-accent-dim)',
                color: jdTheme ? JD_SKY : 'var(--color-accent)',
                background: jdTheme ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = jdTheme
                  ? 'rgba(14, 165, 233, 0.15)'
                  : 'var(--color-accent-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = jdTheme ? 'rgba(14, 165, 233, 0.08)' : 'transparent'
              }}
            >
              {acceptLabel}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDismiss()
              }}
              className="rounded-element border px-3 py-1 font-mono text-xs transition-colors"
              style={{
                borderColor: jdTheme ? 'rgba(148, 163, 184, 0.25)' : 'var(--color-border)',
                color: jdTheme ? JD_MUTED : 'var(--color-text-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-danger)'
                e.currentTarget.style.color = 'var(--color-danger)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = jdTheme ? 'rgba(148, 163, 184, 0.25)' : 'var(--color-border)'
                e.currentTarget.style.color = jdTheme ? JD_MUTED : 'var(--color-text-secondary)'
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

function SectionRail({
  selectedSection,
  onSectionSelect,
  counts,
}: {
  selectedSection: SectionDiagnosticKey | null
  onSectionSelect: (key: SectionDiagnosticKey | null) => void
  counts: Record<SectionDiagnosticKey, number>
}) {
  const btnBase =
    'w-full text-left rounded-element border px-2.5 py-2 text-xs font-medium transition-colors'
  return (
    <nav
      className="flex flex-row flex-wrap md:flex-col gap-1.5 shrink-0 md:w-[148px] pb-2 md:pb-0"
      aria-label="Resume sections"
    >
      <button
        type="button"
        className={cn(btnBase, selectedSection === null && 'jd-alignment-rail-btn-active')}
        style={{
          borderColor: selectedSection === null ? 'transparent' : 'rgba(14, 165, 233, 0.22)',
          color: JD_FG,
          background: selectedSection === null ? undefined : 'rgba(15, 23, 42, 0.5)',
        }}
        onClick={() => onSectionSelect(null)}
      >
        All sections
      </button>
      {SECTION_DIAGNOSTIC_KEYS.map((key) => {
        const label = SECTION_DIAGNOSTIC_LABELS[key]
        const active = selectedSection === key
        const n = counts[key]
        return (
          <button
            key={key}
            type="button"
            className={cn(btnBase, active && 'jd-alignment-rail-btn-active')}
            style={{
              borderColor: active ? 'transparent' : 'rgba(14, 165, 233, 0.22)',
              color: JD_FG,
              background: active ? undefined : 'rgba(15, 23, 42, 0.5)',
            }}
            onClick={() => onSectionSelect(key)}
          >
            <span className="flex items-center justify-between gap-2">
              <span>{label}</span>
              <span className="font-mono text-[10px] opacity-80">[{n}]</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function ResumeAuditSidebarWithDiagnostics({
  sectionDiagnostics,
  accepted,
  dismissed,
  activeFeedbackId,
  onAccept,
  onDismiss,
  onFeedbackSelect,
  accordionMultiple,
  isJobMatch,
  selectedSection,
  onSectionSelect,
  acceptLabel,
}: {
  sectionDiagnostics: SectionDiagnostics
  accepted: Set<string>
  dismissed: Set<string>
  activeFeedbackId: string | null
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
  onFeedbackSelect: (id: string | null) => void
  accordionMultiple: boolean
  isJobMatch?: boolean
  selectedSection?: SectionDiagnosticKey | null
  onSectionSelect?: (key: SectionDiagnosticKey | null) => void
  acceptLabel: string
}) {
  const jdTheme = !!isJobMatch
  const sectionKeys = useMemo(() => {
    return SECTION_DIAGNOSTIC_KEYS.filter(
      (k) => selectedSection == null || selectedSection === k,
    )
  }, [selectedSection])

  const counts = useMemo(() => {
    const c = {} as Record<SectionDiagnosticKey, number>
    for (const k of SECTION_DIAGNOSTIC_KEYS) {
      c[k] = sectionDiagnostics[k].improvements.length
    }
    return c
  }, [sectionDiagnostics])

  const defaultOpen = useMemo(() => {
    const withItems = sectionKeys.filter((k) => sectionDiagnostics[k].improvements.length > 0)
    if (withItems.length === 0) return []
    if (accordionMultiple) return withItems
    return [withItems[0]]
  }, [sectionDiagnostics, accordionMultiple, sectionKeys])

  const accordion = (
    <Accordion
      key={selectedSection ?? 'all'}
      multiple={accordionMultiple}
      defaultValue={defaultOpen}
      className={cn(
        'rounded-card border overflow-hidden min-w-0 flex-1',
        jdTheme && 'border-[rgba(14,165,233,0.22)] bg-[rgba(15,23,42,0.4)]',
      )}
      style={
        jdTheme
          ? undefined
          : { borderColor: 'var(--color-border-strong)', background: 'var(--color-bg-raised)' }
      }
    >
      {sectionKeys.map((key) => {
        const audit = sectionDiagnostics[key]
        const label = SECTION_DIAGNOSTIC_LABELS[key]
        const improvementCount = audit.improvements.length
        const isOptimized = audit.status === 'optimized'

        return (
          <AccordionItem key={key} value={key} className="border-b last:border-b-0 px-0">
            <AccordionTrigger
              className="hover:no-underline px-4 py-3.5 gap-3 items-center cursor-pointer"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <div className="flex flex-1 min-w-0 items-center gap-2.5 text-left flex-wrap">
                {isOptimized ? (
                  <>
                    <CheckCircle2
                      className="size-4 shrink-0"
                      style={{ color: 'var(--color-success)' }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle
                      className="size-4 shrink-0"
                      style={{ color: 'var(--color-warning)' }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{label}</span>
                    <span
                      className="font-mono text-xs rounded-pill border px-2 py-0.5 shrink-0"
                      style={{
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-surface)',
                      }}
                    >
                      [{improvementCount}]
                    </span>
                  </>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <div
                className="rounded-element border px-3 py-3 mb-3 flex flex-col gap-3"
                style={{
                  borderColor: 'var(--color-border-strong)',
                  background: 'var(--color-bg-base)',
                }}
              >
                <p className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
                  {jdTheme ? 'Snapshot' : 'Audit'}
                </p>
                {audit.strengths.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Strengths
                    </p>
                    <ul className="flex flex-col gap-2">
                      {audit.strengths.map((line, idx) => (
                        <li key={`${idx}-${line}`} className="flex items-start gap-2 text-sm">
                          <Check
                            className="size-3.5 shrink-0 mt-0.5"
                            style={{ color: 'var(--color-accent)' }}
                            aria-hidden
                          />
                          <span style={{ color: 'var(--color-text-secondary)' }}>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    No strengths listed for this section.
                  </p>
                )}
              </div>

              {improvementCount === 0 ? (
                <p className="text-sm pl-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  No improvements in this section.
                </p>
              ) : (
                <div className="flex flex-col gap-3 pl-1">
                  {audit.improvements.map((imp) => {
                    const isForge = imp.suggested_line != null && imp.suggested_line.trim() !== ''
                    if (isForge) {
                      return (
                        <SectionImprovementForgeCard
                          key={imp.id}
                          item={imp}
                          isAccepted={accepted.has(imp.id)}
                          isDismissed={dismissed.has(imp.id)}
                          isActive={activeFeedbackId === imp.id}
                          onAccept={() => onAccept(imp.id)}
                          onDismiss={() => onDismiss(imp.id)}
                          onSelect={() => onFeedbackSelect(imp.id)}
                          jdTheme={jdTheme}
                          acceptLabel={acceptLabel}
                        />
                      )
                    }
                    return (
                      <SectionImprovementStrategicTipCard
                        key={imp.id}
                        item={imp}
                        isDismissed={dismissed.has(imp.id)}
                        isActive={activeFeedbackId === imp.id}
                        onDismiss={() => onDismiss(imp.id)}
                        onSelect={() => onFeedbackSelect(imp.id)}
                        jdTheme={jdTheme}
                      />
                    )
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )

  if (jdTheme && onSectionSelect) {
    return (
      <div className="jd-alignment-panel flex flex-col gap-2 min-h-0 flex-1 p-3">
        <div className="flex flex-col md:flex-row gap-3 min-h-0 flex-1">
          <SectionRail
            selectedSection={selectedSection ?? null}
            onSectionSelect={onSectionSelect}
            counts={counts}
          />
          <div className="min-w-0 flex-1 min-h-0 overflow-y-auto">{accordion}</div>
        </div>
      </div>
    )
  }

  return <div className="min-h-0 flex-1 overflow-y-auto">{accordion}</div>
}

function ResumeAuditSidebarLegacy({
  feedback,
  accepted,
  dismissed,
  activeFeedbackId,
  onAccept,
  onDismiss,
  onFeedbackSelect,
  accordionMultiple,
  isJobMatch,
  selectedSection,
  onSectionSelect,
  acceptLabel,
}: Omit<ResumeAuditSidebarProps, 'sectionDiagnostics'>) {
  const grouped = useMemo(() => groupFeedbackBySection(feedback), [feedback])
  const jdTheme = !!isJobMatch

  const legacySections = useMemo(() => {
    if (!selectedSection) return LEGACY_SECTIONS
    return LEGACY_SECTIONS.filter((s) => s.key === selectedSection)
  }, [selectedSection])

  const counts = useMemo(() => {
    const c = {} as Record<AuditSectionKey, number>
    for (const s of LEGACY_SECTIONS) {
      c[s.key] = grouped[s.key].length
    }
    return c
  }, [grouped])

  const defaultOpen = useMemo(() => {
    const withItems = legacySections.filter((s) => grouped[s.key].length > 0).map((s) => s.key)
    if (withItems.length === 0) return []
    if (accordionMultiple) return withItems
    return [withItems[0]]
  }, [grouped, accordionMultiple, legacySections])

  const accordion = (
    <Accordion
      key={selectedSection ?? 'all'}
      multiple={accordionMultiple}
      defaultValue={defaultOpen}
      className={cn(
        'rounded-card border overflow-hidden min-w-0 flex-1',
        jdTheme && 'border-[rgba(14,165,233,0.22)] bg-[rgba(15,23,42,0.4)]',
      )}
      style={
        jdTheme
          ? undefined
          : { borderColor: 'var(--color-border-strong)', background: 'var(--color-bg-raised)' }
      }
    >
      {legacySections.map(({ key, label }) => {
        const items = grouped[key]
        const count = items.length
        const { worst } = sectionSeveritySummary(items)

        return (
          <AccordionItem key={key} value={key} className="border-b last:border-b-0 px-0">
            <AccordionTrigger
              className="hover:no-underline px-4 py-3.5 gap-3 items-center cursor-pointer"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <div className="flex flex-1 min-w-0 items-center gap-2.5 text-left flex-wrap">
                {count === 0 ? (
                  <>
                    <CheckCircle2
                      className="size-4 shrink-0"
                      style={{ color: 'var(--color-success)' }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{label}</span>
                    <span
                      className="font-mono text-xs rounded-pill border px-2 py-0.5 shrink-0"
                      style={{
                        color: 'var(--color-success)',
                        borderColor: 'var(--color-accent-dim)',
                        background: 'var(--color-accent-muted)',
                      }}
                    >
                      ✓ Optimized
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle
                      className="size-4 shrink-0"
                      style={{
                        color:
                          worst === 'high'
                            ? 'var(--color-danger)'
                            : worst === 'medium'
                              ? 'var(--color-warning)'
                              : 'var(--color-text-tertiary)',
                      }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{label}</span>
                    <span
                      className="font-mono text-xs rounded-pill border px-2 py-0.5 shrink-0"
                      style={{
                        color: 'var(--color-text-secondary)',
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-surface)',
                      }}
                    >
                      [{count}]
                    </span>
                    {worst === 'high' ? (
                      <span
                        className="font-mono text-[10px] rounded-pill px-1.5 py-0.5 border shrink-0"
                        style={{
                          color: 'var(--color-danger)',
                          borderColor: 'var(--color-danger)',
                          background: 'var(--color-bg-hover)',
                        }}
                      >
                        high
                      </span>
                    ) : null}
                    {worst === 'medium' ? (
                      <span
                        className="font-mono text-[10px] rounded-pill px-1.5 py-0.5 border shrink-0"
                        style={{
                          color: 'var(--color-warning)',
                          borderColor: 'var(--color-border)',
                          background: 'var(--color-bg-hover)',
                        }}
                      >
                        medium
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              {count === 0 ? (
                <p className="text-sm pl-7" style={{ color: 'var(--color-text-tertiary)' }}>
                  No items in this section.
                </p>
              ) : (
                <div className="flex flex-col gap-4 pl-1">
                  {items.map((item) => (
                    <LegacyAuditFeedbackCard
                      key={item.id}
                      item={item}
                      isAccepted={accepted.has(item.id)}
                      isDismissed={dismissed.has(item.id)}
                      isActive={activeFeedbackId === item.id}
                      onAccept={() => onAccept(item.id)}
                      onDismiss={() => onDismiss(item.id)}
                      onSelect={() => onFeedbackSelect(item.id)}
                      jdTheme={jdTheme}
                      acceptLabel={acceptLabel}
                    />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )

  if (jdTheme && onSectionSelect) {
    return (
      <div className="jd-alignment-panel flex flex-col gap-2 min-h-0 flex-1 p-3">
        <div className="flex flex-col md:flex-row gap-3 min-h-0 flex-1">
          <SectionRail
            selectedSection={selectedSection ?? null}
            onSectionSelect={onSectionSelect}
            counts={counts}
          />
          <div className="min-w-0 flex-1 min-h-0 overflow-y-auto">{accordion}</div>
        </div>
      </div>
    )
  }

  return <div className="min-h-0 flex-1 overflow-y-auto">{accordion}</div>
}

export function ResumeAuditSidebar({
  feedback,
  sectionDiagnostics,
  accepted,
  dismissed,
  activeFeedbackId,
  onAccept,
  onDismiss,
  onFeedbackSelect,
  accordionMultiple = true,
  isJobMatch = false,
  selectedSection = null,
  onSectionSelect,
}: ResumeAuditSidebarProps) {
  const acceptLabel = isJobMatch ? 'Sync to JD' : 'Accept change'

  if (sectionDiagnostics) {
    return (
      <ResumeAuditSidebarWithDiagnostics
        sectionDiagnostics={sectionDiagnostics}
        accepted={accepted}
        dismissed={dismissed}
        activeFeedbackId={activeFeedbackId}
        onAccept={onAccept}
        onDismiss={onDismiss}
        onFeedbackSelect={onFeedbackSelect}
        accordionMultiple={accordionMultiple}
        isJobMatch={isJobMatch}
        selectedSection={selectedSection}
        onSectionSelect={onSectionSelect}
        acceptLabel={acceptLabel}
      />
    )
  }

  return (
    <ResumeAuditSidebarLegacy
      feedback={feedback}
      accepted={accepted}
      dismissed={dismissed}
      activeFeedbackId={activeFeedbackId}
      onAccept={onAccept}
      onDismiss={onDismiss}
      onFeedbackSelect={onFeedbackSelect}
      accordionMultiple={accordionMultiple}
      isJobMatch={isJobMatch}
      selectedSection={selectedSection}
      onSectionSelect={onSectionSelect}
      acceptLabel={acceptLabel}
    />
  )
}
