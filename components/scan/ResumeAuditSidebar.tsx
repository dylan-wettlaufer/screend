'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { FeedbackItem as FeedbackItemType } from '@/lib/types'

export type AuditSectionKey = 'header' | 'experience' | 'projects' | 'skills' | 'education'

const SECTIONS: { key: AuditSectionKey; label: string }[] = [
  { key: 'header', label: 'Header' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'education', label: 'Education' },
]

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
  accepted: Set<string>
  dismissed: Set<string>
  activeFeedbackId: string | null
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
  onFeedbackSelect: (id: string | null) => void
  accordionMultiple?: boolean
}

function AuditFeedbackCard({
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
  const severityDot: Record<FeedbackItemType['severity'], string> = {
    high: 'var(--color-danger)',
    medium: '#EF9F27',
    low: 'var(--color-success)',
  }
  const dot = severityDot[item.severity]
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

      {reasoningText ? (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setReasoningOpen((o) => !o)
            }}
            className="flex items-center gap-1.5 text-left font-mono text-xs outline-none rounded-element py-1 -my-1 w-fit"
            style={{ color: 'var(--color-text-tertiary)' }}
            aria-expanded={reasoningOpen}
          >
            <ChevronDown
              className={cn('size-3.5 shrink-0 transition-transform', reasoningOpen && 'rotate-180')}
              aria-hidden
            />
            Why this matters
          </button>
          {reasoningOpen ? (
            <p className="text-sm leading-relaxed pl-5" style={{ color: 'var(--color-text-secondary)' }}>
              {reasoningText}
            </p>
          ) : null}
        </div>
      ) : null}

      {hasDiff ? (
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

export function ResumeAuditSidebar({
  feedback,
  accepted,
  dismissed,
  activeFeedbackId,
  onAccept,
  onDismiss,
  onFeedbackSelect,
  accordionMultiple = true,
}: ResumeAuditSidebarProps) {
  const grouped = useMemo(() => groupFeedbackBySection(feedback), [feedback])

  const defaultOpen = useMemo(() => {
    const withItems = SECTIONS.filter((s) => grouped[s.key].length > 0).map((s) => s.key)
    if (withItems.length === 0) return []
    if (accordionMultiple) return withItems
    return [withItems[0]]
  }, [grouped, accordionMultiple])

  return (
    <Accordion
      multiple={accordionMultiple}
      defaultValue={defaultOpen}
      className="rounded-card border overflow-hidden"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-raised)' }}
    >
      {SECTIONS.map(({ key, label }) => {
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
                              ? '#EF9F27'
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
                          borderColor: '#5a2020',
                          background: '#2a1515',
                        }}
                      >
                        high
                      </span>
                    ) : null}
                    {worst === 'medium' ? (
                      <span
                        className="font-mono text-[10px] rounded-pill px-1.5 py-0.5 border shrink-0"
                        style={{
                          color: '#EF9F27',
                          borderColor: 'rgba(239, 159, 39, 0.35)',
                          background: 'rgba(239, 159, 39, 0.12)',
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
                <div className="flex flex-col gap-3 pl-1">
                  {items.map((item) => (
                    <AuditFeedbackCard
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
