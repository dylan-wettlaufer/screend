import type { StructuredResume, SectionDiagnosticKey, FeedbackItem } from '@/lib/types'
import { mapFeedbackSectionToDiagnosticKey } from '@/lib/mapFeedbackSectionToDiagnosticKey'

/** Maps `header.name` / `experience.0.bullets.1` / `skills.languages` to editor fieldset keys. */
export function fieldPathToSectionKey(path: string): SectionDiagnosticKey | null {
  const root = path.split('.')[0]
  if (root === 'header') return 'header'
  if (root === 'education') return 'education'
  if (root === 'skills') return 'skills'
  if (root === 'experience') return 'experience'
  if (root === 'projects') return 'projects'
  return null
}

function diffHeader(before: StructuredResume, after: StructuredResume): string | null {
  const headerKeys = ['name', 'phone', 'email', 'linkedin', 'github'] as const
  for (const k of headerKeys) {
    if (before[k] !== after[k]) return `header.${k}`
  }
  return null
}

function diffEducation(before: StructuredResume, after: StructuredResume): string | null {
  const maxEdu = Math.max(before.education.length, after.education.length)
  for (let i = 0; i < maxEdu; i++) {
    const b = before.education[i]
    const a = after.education[i]
    if (!b || !a) return `education.${i}.school`
    const eduKeys = [
      'school',
      'degree',
      'location',
      'start',
      'end',
      'honors',
      'coursework',
    ] as const
    for (const ek of eduKeys) {
      if (b[ek] !== a[ek]) return `education.${i}.${ek}`
    }
  }
  return null
}

function diffSkills(before: StructuredResume, after: StructuredResume): string | null {
  const skillKeys = ['languages', 'frameworks', 'developer_tools', 'libraries'] as const
  for (const sk of skillKeys) {
    if (before.skills[sk] !== after.skills[sk]) return `skills.${sk}`
  }
  return null
}

function diffExperience(before: StructuredResume, after: StructuredResume): string | null {
  const maxExp = Math.max(before.experience.length, after.experience.length)
  for (let i = 0; i < maxExp; i++) {
    const b = before.experience[i]
    const a = after.experience[i]
    if (!b || !a) return `experience.${i}.company`
    const exKeys = ['title', 'company', 'location', 'start', 'end'] as const
    for (const xk of exKeys) {
      if (b[xk] !== a[xk]) return `experience.${i}.${xk}`
    }
    const maxBul = Math.max(b.bullets.length, a.bullets.length)
    for (let bi = 0; bi < maxBul; bi++) {
      const bb = b.bullets[bi] ?? ''
      const ab = a.bullets[bi] ?? ''
      if (bb !== ab) return `experience.${i}.bullets.${bi}`
    }
  }
  return null
}

function diffProjects(before: StructuredResume, after: StructuredResume): string | null {
  const maxProj = Math.max(before.projects.length, after.projects.length)
  for (let i = 0; i < maxProj; i++) {
    const b = before.projects[i]
    const a = after.projects[i]
    if (!b || !a) return `projects.${i}.name`
    const pk = ['name', 'technologies', 'start', 'end'] as const
    for (const x of pk) {
      if (b[x] !== a[x]) return `projects.${i}.${x}`
    }
    const maxBul = Math.max(b.bullets.length, a.bullets.length)
    for (let bi = 0; bi < maxBul; bi++) {
      const bb = b.bullets[bi] ?? ''
      const ab = a.bullets[bi] ?? ''
      if (bb !== ab) return `projects.${i}.bullets.${bi}`
    }
  }
  return null
}

/**
 * First differing field path, restricted to the section this feedback item belongs to
 * (so the accept flash targets the right editor control, not e.g. skills when you accepted experience).
 */
export function findStructuredResumeFieldPathForFeedback(
  before: StructuredResume,
  after: StructuredResume,
  item: FeedbackItem,
): string | null {
  const key = mapFeedbackSectionToDiagnosticKey(item.section)
  switch (key) {
    case 'header':
      return diffHeader(before, after)
    case 'education':
      return diffEducation(before, after)
    case 'skills':
      return diffSkills(before, after)
    case 'experience':
      return diffExperience(before, after)
    case 'projects':
      return diffProjects(before, after)
  }
}

/**
 * Returns a stable path for the first differing string field (depth-first),
 * e.g. `header.email`, `experience.0.bullets.2`, `skills.languages`.
 */
export function findFirstStructuredResumeFieldPath(
  before: StructuredResume,
  after: StructuredResume,
): string | null {
  return (
    diffHeader(before, after) ??
    diffEducation(before, after) ??
    diffSkills(before, after) ??
    diffExperience(before, after) ??
    diffProjects(before, after)
  )
}
