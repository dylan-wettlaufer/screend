'use client'

/**
 * React preview mirroring lib/resumeLatex + lib/resumeModel section order and rules.
 * Light “paper” shell and Source Serif 4 to approximate LaTeX/Jake’s-style PDF output.
 */

import { Source_Serif_4 } from 'next/font/google'
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

const resumePreviewFont = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

interface JakesResumePreviewProps {
  resume: StructuredResume
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-2.5">
      <h2
        className="text-[11px] font-medium tracking-[0.06em] mb-0 pb-0.5 leading-tight"
        style={{
          fontVariant: 'small-caps',
          fontFeatureSettings: "'smcp', 'kern', 'liga'",
          color: 'var(--resume-paper-fg)',
          borderBottom: '0.5px solid var(--resume-paper-rule)',
        }}
      >
        {title}
      </h2>
      <div className="mt-1">{children}</div>
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
    <div className="mb-1.5">
      <div
        className="flex justify-between gap-3 text-[11px]"
        style={{ lineHeight: 1.18 }}
      >
        <span className="font-medium" style={{ color: 'var(--resume-paper-fg)' }}>
          {line1Left}
        </span>
        <span
          className="shrink-0 text-right font-medium tabular-nums"
          style={{ color: 'var(--resume-paper-fg)' }}
        >
          {line1Right}
        </span>
      </div>
      <div
        className="flex justify-between gap-3 text-[10.5px] italic"
        style={{ lineHeight: 1.18 }}
      >
        <span style={{ color: 'var(--resume-paper-muted)' }}>{line2Left}</span>
        <span
          className="shrink-0 text-right font-normal not-italic"
          style={{ color: 'var(--resume-paper-muted)' }}
        >
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
    <ul
      className="list-disc pl-[0.95rem] space-y-0 mb-1.5 marker:text-[var(--resume-paper-hint)]"
      style={{
        fontSize: '10.5px',
        lineHeight: 1.22,
      }}
    >
      {filtered.map((b, i) => (
        <li key={i} style={{ color: 'var(--resume-paper-muted)' }}>
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
      <div className="flex justify-between gap-3 text-[10.5px] leading-snug mb-1">
        <span style={{ color: 'var(--resume-paper-fg)' }}>
          <span className="font-medium">{name}</span>
          {technologies.trim() !== '' && (
            <>
              <span style={{ color: 'var(--resume-paper-hint)' }}>{' | '}</span>
              <span className="italic font-normal" style={{ color: 'var(--resume-paper-muted)' }}>
                {technologies}
              </span>
            </>
          )}
        </span>
        <span
          className="shrink-0 text-right font-medium tabular-nums"
          style={{ color: 'var(--resume-paper-fg)' }}
        >
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
      className={[
        resumePreviewFont.className,
        'resume-preview-paper',
        'mx-auto w-full max-w-[8.5in] min-h-full px-8 py-6 rounded-element border',
      ].join(' ')}
      style={{
        background: 'var(--resume-paper-bg)',
        borderColor: 'var(--resume-paper-border)',
        color: 'var(--resume-paper-fg)',
      }}
    >
      <header className="text-center mb-3.5">
        <h1
          className="text-[17px] font-medium mb-1 leading-tight"
          style={{
            fontVariant: 'small-caps',
            fontFeatureSettings: "'smcp', 'kern', 'liga'",
            letterSpacing: '0.08em',
            color: 'var(--resume-paper-fg)',
          }}
        >
          {resume.name}
        </h1>
        <p
          className="text-[10px] tracking-wide"
          style={{ color: 'var(--resume-paper-muted)', lineHeight: 1.25 }}
        >
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
            className="text-[10.5px] space-y-0.5 pl-0.5"
            style={{ color: 'var(--resume-paper-muted)', lineHeight: 1.22 }}
          >
            {getSkillLines(resume).map((line, i) => (
              <p key={i}>
                <span className="font-medium" style={{ color: 'var(--resume-paper-fg)' }}>
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
