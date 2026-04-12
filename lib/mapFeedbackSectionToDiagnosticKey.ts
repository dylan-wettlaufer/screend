import type { SectionDiagnosticKey } from '@/lib/types'

/** Maps AI / UI section labels (e.g. "Experience — Acme", "Skills") to structured editor section ids. */
export function mapFeedbackSectionToDiagnosticKey(section: string): SectionDiagnosticKey {
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
