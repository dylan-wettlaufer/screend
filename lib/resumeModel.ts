/**
 * Shared resume section rules for Jake's-style output.
 * Keep in sync with lib/resumeLatex.ts (which consumes these helpers) and
 * components/scan/jakesResumePreview (visual preview).
 *
 * Section order: Education, Technical Skills, Experience, Projects.
 */

import type { StructuredResume } from '@/lib/types'

export type EducationEntry = StructuredResume['education'][number]
export type ExperienceEntry = StructuredResume['experience'][number]
export type ProjectEntry = StructuredResume['projects'][number]

export function getVisibleEducation(resume: StructuredResume): EducationEntry[] {
  return resume.education.filter((e) => e.school.trim() !== '')
}

export function getEducationBullets(entry: EducationEntry): string[] {
  const bullets = [
    entry.honors?.trim() ?? '',
    entry.coursework?.trim() ? `Coursework: ${entry.coursework}` : '',
  ]
  return bullets.filter(Boolean)
}

export function getVisibleExperience(resume: StructuredResume): ExperienceEntry[] {
  return resume.experience.filter((e) => e.company.trim() !== '')
}

export function getVisibleProjects(resume: StructuredResume): ProjectEntry[] {
  return resume.projects.filter((p) => p.name.trim() !== '')
}

export interface SkillLine {
  label: string
  body: string
}

export function getSkillLines(resume: StructuredResume): SkillLine[] {
  const lines: SkillLine[] = []
  if (resume.skills.languages?.trim()) {
    lines.push({ label: 'Languages', body: resume.skills.languages })
  }
  if (resume.skills.frameworks?.trim()) {
    lines.push({ label: 'Frameworks', body: resume.skills.frameworks })
  }
  if (resume.skills.developer_tools?.trim()) {
    lines.push({ label: 'Developer Tools', body: resume.skills.developer_tools })
  }
  if (resume.skills.libraries?.trim()) {
    lines.push({ label: 'Libraries', body: resume.skills.libraries })
  }
  return lines
}

/** Matches LaTeX resumeSubheading date column */
export function subheadingDateRange(start: string, end: string): string {
  return `${start} -- ${end}`
}

/** Matches LaTeX resumeProjectHeading right column */
export function projectDateRight(start: string, end: string): string {
  return end.trim() !== '' ? `${start} -- ${end}` : start
}

export function filterResumeBullets(items: string[]): string[] {
  return items.filter((b) => b && b.trim() !== '')
}

export function hasEducationContent(resume: StructuredResume): boolean {
  return getVisibleEducation(resume).length > 0
}

export function hasSkillsContent(resume: StructuredResume): boolean {
  return getSkillLines(resume).length > 0
}

export function hasExperienceContent(resume: StructuredResume): boolean {
  return getVisibleExperience(resume).length > 0
}

export function hasProjectsContent(resume: StructuredResume): boolean {
  return getVisibleProjects(resume).length > 0
}
