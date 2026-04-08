import type { FeedbackItem, StructuredResume } from '@/lib/types'

function replaceAll(haystack: string, from: string, to: string): string {
  if (from === '') return haystack
  return haystack.split(from).join(to)
}

/** Applies one substring replacement across every string field in the structured resume tree. */
function replaceAcrossStructuredResume(
  resume: StructuredResume,
  from: string,
  to: string,
): StructuredResume {
  const next = structuredClone(resume) as StructuredResume

  for (const key of ['name', 'phone', 'email', 'linkedin', 'github'] as const) {
    next[key] = replaceAll(next[key], from, to)
  }

  for (const edu of next.education) {
    for (const key of ['school', 'degree', 'location', 'start', 'end', 'honors', 'coursework'] as const) {
      edu[key] = replaceAll(edu[key], from, to)
    }
  }

  for (const ex of next.experience) {
    for (const key of ['title', 'company', 'location', 'start', 'end'] as const) {
      ex[key] = replaceAll(ex[key], from, to)
    }
    ex.bullets = ex.bullets.map((b) => replaceAll(b, from, to))
  }

  for (const p of next.projects) {
    for (const key of ['name', 'technologies', 'start', 'end'] as const) {
      p[key] = replaceAll(p[key], from, to)
    }
    p.bullets = p.bullets.map((b) => replaceAll(b, from, to))
  }

  for (const key of ['languages', 'frameworks', 'developer_tools', 'libraries'] as const) {
    next.skills[key] = replaceAll(next.skills[key], from, to)
  }

  return next
}

/**
 * For each accepted feedback item with line-level suggestion, replace `original_line` with
 * `suggested_line` in every string field (feedback list order).
 */
export function applyAcceptedFeedbackToStructuredResume(
  resume: StructuredResume,
  feedback: FeedbackItem[],
  acceptedIds: Set<string>,
): StructuredResume {
  let next = resume
  for (const item of feedback) {
    if (!acceptedIds.has(item.id)) continue
    const from = item.original_line
    const to = item.suggested_line
    if (from == null || to == null || from === '') continue
    const before = JSON.stringify(next)
    const patched = replaceAcrossStructuredResume(next, from, to)
    if (before === JSON.stringify(patched)) {
      console.warn(
        '[applyAcceptedFeedbackToStructuredResume] original_line not found in structured resume:',
        item.id,
      )
    }
    next = patched
  }
  return next
}
