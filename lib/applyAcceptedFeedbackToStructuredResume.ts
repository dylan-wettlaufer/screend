import type { FeedbackItem, StructuredResume } from '@/lib/types'

/** trim + single spaces between words */
export function normalizeWs(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

/** Strip a leading markdown-ish bullet for matching only (not for replacement text). */
export function stripBulletPrefix(s: string): string {
  return normalizeWs(s).replace(/^[-*•]\s*/, '')
}

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

const SHORT_FIELD_MAX_LEN = 160

function buildNeedles(from: string): string[] {
  const t = normalizeWs(from)
  const stripped = stripBulletPrefix(from)
  const candidates = [from, from.trim(), t, stripped, stripBulletPrefix(t)]
  const out: string[] = []
  const seen = new Set<string>()
  for (const c of candidates) {
    if (c !== '' && !seen.has(c)) {
      seen.add(c)
      out.push(c)
    }
  }
  return out
}

function bulletSectionOrder(item: FeedbackItem): Array<'experience' | 'projects'> {
  const s = item.section
  const expFirst = /experience|work|employment|professional/i.test(s)
  const projFirst = /project/i.test(s)
  if (projFirst && !expFirst) return ['projects', 'experience']
  return ['experience', 'projects']
}

function normalizedBulletMatch(bullet: string, from: string): boolean {
  return (
    normalizeWs(stripBulletPrefix(bullet)) === normalizeWs(stripBulletPrefix(from))
  )
}

function applyWholeBulletReplace(
  resume: StructuredResume,
  item: FeedbackItem,
  toTrim: string,
): StructuredResume {
  const next = structuredClone(resume) as StructuredResume
  const order = bulletSectionOrder(item)

  for (const section of order) {
    if (section === 'experience') {
      for (const ex of next.experience) {
        ex.bullets = ex.bullets.map((b) =>
          normalizedBulletMatch(b, item.original_line ?? '') ? toTrim : b,
        )
      }
    } else {
      for (const p of next.projects) {
        p.bullets = p.bullets.map((b) =>
          normalizedBulletMatch(b, item.original_line ?? '') ? toTrim : b,
        )
      }
    }
  }
  return next
}

function applyShortFieldWholeReplace(
  resume: StructuredResume,
  fromNorm: string,
  toTrim: string,
): StructuredResume {
  const next = structuredClone(resume) as StructuredResume

  const replaceIfMatch = (v: string): string => {
    if (v.length > SHORT_FIELD_MAX_LEN) return v
    if (normalizeWs(stripBulletPrefix(v)) !== fromNorm) return v
    return toTrim
  }

  for (const key of ['name', 'phone', 'email', 'linkedin', 'github'] as const) {
    next[key] = replaceIfMatch(next[key])
  }

  for (const edu of next.education) {
    for (const key of ['school', 'degree', 'location', 'start', 'end'] as const) {
      edu[key] = replaceIfMatch(edu[key])
    }
  }

  for (const ex of next.experience) {
    for (const key of ['title', 'company', 'location', 'start', 'end'] as const) {
      ex[key] = replaceIfMatch(ex[key])
    }
  }

  for (const p of next.projects) {
    for (const key of ['name', 'technologies', 'start', 'end'] as const) {
      p[key] = replaceIfMatch(p[key])
    }
  }

  return next
}

/** Applies one feedback item’s line-level suggestion using exact needles, then whole-bullet, then short-field strategies. */
function applyOneLineItem(resume: StructuredResume, item: FeedbackItem): StructuredResume {
  const from = item.original_line
  const to = item.suggested_line
  if (from == null || to == null || from === '') return resume

  const toTrim = to.trim()
  let cur = resume
  const before = JSON.stringify(cur)

  for (const needle of buildNeedles(from)) {
    const patched = replaceAcrossStructuredResume(cur, needle, toTrim)
    if (JSON.stringify(patched) !== JSON.stringify(cur)) {
      cur = patched
      break
    }
  }

  if (JSON.stringify(cur) !== before) {
    return cur
  }

  cur = applyWholeBulletReplace(cur, item, toTrim)
  if (JSON.stringify(cur) !== before) {
    return cur
  }

  const fromNorm = normalizeWs(stripBulletPrefix(from))
  if (fromNorm !== '') {
    cur = applyShortFieldWholeReplace(cur, fromNorm, toTrim)
  }

  return cur
}

export interface ApplyAcceptedFeedbackResult {
  resume: StructuredResume
  /** Accepted items that had original/suggested lines but did not change the resume */
  unmatchedLineItemIds: string[]
}

/**
 * For each accepted feedback item with line-level suggestion, merge into structured resume
 * (feedback list order).
 */
export function applyAcceptedFeedbackToStructuredResume(
  resume: StructuredResume,
  feedback: FeedbackItem[],
  acceptedIds: Set<string>,
): ApplyAcceptedFeedbackResult {
  let next = resume
  const unmatchedLineItemIds: string[] = []

  for (const item of feedback) {
    if (!acceptedIds.has(item.id)) continue
    const from = item.original_line
    const to = item.suggested_line
    if (from == null || to == null || from === '') continue

    const beforeItem = JSON.stringify(next)
    next = applyOneLineItem(next, item)
    if (beforeItem === JSON.stringify(next)) {
      console.warn(
        '[applyAcceptedFeedbackToStructuredResume] original_line not matched in structured resume:',
        item.id,
      )
      unmatchedLineItemIds.push(item.id)
    }
  }

  return { resume: next, unmatchedLineItemIds }
}
