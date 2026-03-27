'use client'

/**
 * React preview mirroring lib/resumeLatex + lib/resumeModel section order and rules.
 * Uses design tokens only (no hex). Letter-width page shell for readability.
 */

import type { StructuredResume } from '@/lib/types'
import {
  filterResumeBullets,
  getEducationBullets,
  getSkillLines,
  getVisibleEducation,
  getVisibleExperience,
  getVisibleProjects,
  hasEducationContent,
  hasExperienceContent,
  hasProjectsContent,
  hasSkillsContent,
  projectDateRight,
  subheadingDateRange,
} from '@/lib/resumeModel'

interface JakesResumePreviewProps {
  resume: StructuredResume
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3">
      <h2
        className="text-xs font-medium tracking-wide mb-0 pb-1"
        style={{
          fontVariant: 'small-caps',
          color: 'var(--color-text-primary)',
          borderBottom: '0.5px solid var(--color-border)',
        }}
      >
        {title}
      </h2>
      <div className="mt-1.5">{children}</div>
    </section>
  )
}

function PreviewSubheading({
  line1Left,
  line1Right,
  line2Left,
  line2Right,
}: {
  line1Left: string
  line1Right: string
  line2Left: string
  line2Right: string
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between gap-3 text-[11px] leading-snug">
        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {line1Left}
        </span>
        <span className="shrink-0 text-right font-mono" style={{ color: 'var(--color-text-primary)' }}>
          {line1Right}
        </span>
      </div>
      <div className="flex justify-between gap-3 text-[10px] leading-snug italic">
        <span style={{ color: 'var(--color-text-secondary)' }}>{line2Left}</span>
        <span className="shrink-0 text-right" style={{ color: 'var(--color-text-secondary)' }}>
          {line2Right}
        </span>
      </div>
    </div>
  )
}

function PreviewBulletList({ items }: { items: string[] }) {
  const filtered = filterResumeBullets(items)
  if (filtered.length === 0) return null
  return (
    <ul className="list-disc pl-[0.62rem] space-y-0.5 mb-2" style={{ fontSize: '10px', lineHeight: 1.35 }}>
      {filtered.map((b, i) => (
        <li key={i} style={{ color: 'var(--color-text-secondary)' }}>
          {b}
        </li>
      ))}
    </ul>
  )
}

function PreviewProjectBlock({
  name,
  technologies,
  dateRight,
  bullets,
}: {
  name: string
  technologies: string
  dateRight: string
  bullets: string[]
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between gap-3 text-[10px] leading-snug mb-1">
        <span style={{ color: 'var(--color-text-primary)' }}>
          <span className="font-medium">{name}</span>
          {technologies.trim() !== '' && (
            <>
              <span style={{ color: 'var(--color-text-tertiary)' }}>{' | '}</span>
              <span className="italic" style={{ color: 'var(--color-text-secondary)' }}>
                {technologies}
              </span>
            </>
          )}
        </span>
        <span className="shrink-0 text-right font-mono" style={{ color: 'var(--color-text-primary)' }}>
          {dateRight}
        </span>
      </div>
      <PreviewBulletList items={bullets} />
    </div>
  )
}

export function JakesResumePreview({ resume }: JakesResumePreviewProps) {
  return (
    <div
      className="mx-auto w-full max-w-[8.5in] min-h-full px-6 py-5 rounded-element border"
      style={{
        background: 'var(--color-bg-base)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)',
      }}
    >
      <header className="text-center mb-4">
        <h1
          className="text-base font-medium mb-1"
          style={{ fontVariant: 'small-caps', letterSpacing: '0.02em' }}
        >
          {resume.name}
        </h1>
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {[
            resume.phone,
            resume.email,
            resume.linkedin?.trim() ? `linkedin.com/in/${resume.linkedin}` : '',
            resume.github?.trim() ? `github.com/${resume.github}` : '',
          ]
            .filter(Boolean)
            .join(' | ')}
        </p>
      </header>

      {hasEducationContent(resume) && (
        <PreviewSection title="Education">
          {getVisibleEducation(resume).map((e, idx) => (
            <div key={idx}>
              <PreviewSubheading
                line1Left={e.school}
                line1Right={subheadingDateRange(e.start, e.end)}
                line2Left={e.degree}
                line2Right={e.location}
              />
              <PreviewBulletList items={getEducationBullets(e)} />
            </div>
          ))}
        </PreviewSection>
      )}

      {hasSkillsContent(resume) && (
        <PreviewSection title="Technical skills">
          <div
            className="text-[10px] leading-relaxed space-y-1 pl-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {getSkillLines(resume).map((line, i) => (
              <p key={i}>
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {line.label}:
                </span>{' '}
                {line.body}
              </p>
            ))}
          </div>
        </PreviewSection>
      )}

      {hasExperienceContent(resume) && (
        <PreviewSection title="Experience">
          {getVisibleExperience(resume).map((e, idx) => (
            <div key={idx}>
              <PreviewSubheading
                line1Left={e.company}
                line1Right={subheadingDateRange(e.start, e.end)}
                line2Left={e.title}
                line2Right={e.location}
              />
              <PreviewBulletList items={e.bullets} />
            </div>
          ))}
        </PreviewSection>
      )}

      {hasProjectsContent(resume) && (
        <PreviewSection title="Projects">
          {getVisibleProjects(resume).map((p, idx) => (
            <PreviewProjectBlock
              key={idx}
              name={p.name}
              technologies={p.technologies}
              dateRight={projectDateRight(p.start, p.end)}
              bullets={p.bullets}
            />
          ))}
        </PreviewSection>
      )}
    </div>
  )
}
