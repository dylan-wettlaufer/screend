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
}: {
  originalLine: string | null
  suggestedLine: string
  isAccepted: boolean
}) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-element overflow-hidden border font-mono text-xs leading-relaxed"
      style={{
        borderColor: isAccepted ? 'var(--color-accent-dim)' : 'var(--color-border)',
      }}
    >
      {originalLine ? (
        <div className="px-3 py-2 flex gap-2 items-start" style={{ background: 'var(--color-bg-hover)' }}>
          <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-danger)' }}>
            −
          </span>
          <p className="flex-1 line-through" style={{ color: 'var(--color-danger)' }}>
            {originalLine}
          </p>
        </div>
      ) : null}
      <div className="px-3 py-2 flex gap-2 items-start" style={{ background: 'var(--color-accent-muted)' }}>
        <span className="shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }}>
          +
        </span>
        <p className="flex-1" style={{ color: 'var(--color-accent)' }}>
          {suggestedLine}
        </p>
      </div>
    </div>
  )
}

function WhyThisMattersToggle({
  reasoningText,
  open,
  onToggle,
  stopCardClick,
}: {
  reasoningText: string
  open: boolean
  onToggle: () => void
  stopCardClick: (e: MouseEvent | KeyboardEvent) => void
}) {
  if (!reasoningText) return null
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={(e) => {
          stopCardClick(e)
          onToggle()
        }}
        className="flex items-center gap-1.5 text-left font-mono text-xs outline-none rounded-element py-1 -my-1 w-fit"
        style={{ color: 'var(--color-text-tertiary)' }}
        aria-expanded={open}
      >
        <ChevronDown
          className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
        Why this matters
      </button>
      {open ? (
        <p className="text-sm leading-relaxed pl-5" style={{ color: 'var(--color-text-secondary)' }}>
          {reasoningText}
        </p>
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
}: {
  item: SectionImprovement
  isAccepted: boolean
  isDismissed: boolean
  isActive: boolean
  onAccept: () => void
  onDismiss: () => void
  onSelect: () => void
}) {
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const dot = severityDotClass(item.severity)
  const reasoningText = item.reasoning?.trim() ?? ''
  const suggested = item.suggested_line?.trim() ?? ''

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
        background: 'var(--color-bg-raised)',
        borderColor: isActive
          ? 'var(--color-accent)'
          : isAccepted
            ? 'var(--color-border-strong)'
            : 'var(--color-accent-dim)',
      }}
    >
      <p className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--color-accent)' }}>
        Forge
      </p>
      <div className="flex items-start gap-2.5">
        <div className="mt-1 shrink-0">
          <div className="h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-text-primary)' }}>
            {item.title}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {item.description}
      </p>

      <WhyThisMattersToggle
        reasoningText={reasoningText}
        open={reasoningOpen}
        onToggle={() => setReasoningOpen((o) => !o)}
        stopCardClick={(e) => e.stopPropagation()}
      />

      <LineDiffViewer
        originalLine={item.original_line}
        suggestedLine={suggested}
        isAccepted={isAccepted}
      />

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
              onClick={(e) => {
                e.stopPropagation()
                onAccept()
              }}
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
              Accept change
            </button>
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
}: {
  item: SectionImprovement
  isDismissed: boolean
  isActive: boolean
  onDismiss: () => void
  onSelect: () => void
}) {
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const dot = severityDotClass(item.severity)
  const reasoningText = item.reasoning?.trim() ?? ''

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
        background: 'var(--color-bg-surface)',
        borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      <p className="font-mono text-[10px] tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
        Strategic tip
      </p>
      <div className="flex items-start gap-2.5">
        <div className="mt-1 shrink-0">
          <div className="h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-text-primary)' }}>
            {item.title}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {item.description}
      </p>

      <WhyThisMattersToggle
        reasoningText={reasoningText}
        open={reasoningOpen}
        onToggle={() => setReasoningOpen((o) => !o)}
        stopCardClick={(e) => e.stopPropagation()}
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
}: {
  item: FeedbackItemType
  isAccepted: boolean
  isDismissed: boolean
  isActive: boolean
  onAccept: () => void
  onDismiss: () => void
  onSelect: () => void
}) {
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const dot = severityDotClass(item.severity)
  const hasDiff = !!(item.original_line && item.suggested_line)
  const reasoningText = item.reasoning?.trim() ?? ''

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
        background: 'var(--color-bg-surface)',
        borderColor: isActive
          ? 'var(--color-accent)'
          : isAccepted
            ? 'var(--color-border-strong)'
            : 'var(--color-border)',
      }}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-1 shrink-0">
          <div className="h-2 w-2 rounded-full" style={{ background: dot }} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium leading-snug"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {item.title}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {item.description}
      </p>

      <WhyThisMattersToggle
        reasoningText={reasoningText}
        open={reasoningOpen}
        onToggle={() => setReasoningOpen((o) => !o)}
        stopCardClick={(e) => e.stopPropagation()}
      />

      {hasDiff ? (
        <LineDiffViewer
          originalLine={item.original_line}
          suggestedLine={item.suggested_line ?? ''}
          isAccepted={isAccepted}
        />
      ) : null}

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
              onClick={(e) => {
                e.stopPropagation()
                onAccept()
              }}
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
              Accept change
            </button>
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
          </>
        )}
      </div>
    </div>
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
}: {
  sectionDiagnostics: SectionDiagnostics
  accepted: Set<string>
  dismissed: Set<string>
  activeFeedbackId: string | null
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
  onFeedbackSelect: (id: string | null) => void
  accordionMultiple: boolean
}) {
  const defaultOpen = useMemo(() => {
    const withItems = SECTION_DIAGNOSTIC_KEYS.filter(
      (k) => sectionDiagnostics[k].improvements.length > 0,
    )
    if (withItems.length === 0) return []
    if (accordionMultiple) return withItems
    return [withItems[0]]
  }, [sectionDiagnostics, accordionMultiple])

  return (
    <Accordion
      multiple={accordionMultiple}
      defaultValue={defaultOpen}
      className="rounded-card border overflow-hidden"
      style={{ borderColor: 'var(--color-border-strong)', background: 'var(--color-bg-raised)' }}
    >
      {SECTION_DIAGNOSTIC_KEYS.map((key) => {
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
                  Audit
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
}: Omit<ResumeAuditSidebarProps, 'sectionDiagnostics'>) {
  const grouped = useMemo(() => groupFeedbackBySection(feedback), [feedback])

  const defaultOpen = useMemo(() => {
    const withItems = LEGACY_SECTIONS.filter((s) => grouped[s.key].length > 0).map((s) => s.key)
    if (withItems.length === 0) return []
    if (accordionMultiple) return withItems
    return [withItems[0]]
  }, [grouped, accordionMultiple])

  return (
    <Accordion
      multiple={accordionMultiple}
      defaultValue={defaultOpen}
      className="rounded-card border overflow-hidden"
      style={{ borderColor: 'var(--color-border-strong)', background: 'var(--color-bg-raised)' }}
    >
      {LEGACY_SECTIONS.map(({ key, label }) => {
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
}: ResumeAuditSidebarProps) {
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
    />
  )
}
