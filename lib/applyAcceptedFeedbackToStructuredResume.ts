import type { FeedbackItem, StructuredResume } from '@/lib/types'

const SKILL_FIELD_KEYS = ['languages', 'frameworks', 'developer_tools', 'libraries'] as const

type SkillFieldKey = (typeof SKILL_FIELD_KEYS)[number]

function isSkillsFeedbackItem(item: FeedbackItem): boolean {
  return /skill|certif|tech stack|technical skill/i.test(item.section)
}

function pickSkillsAppendTarget(suggested: string): SkillFieldKey {
  const s = suggested.toLowerCase()
  if (
    /\b(python|java|typescript|javascript|js\b|golang|go\b|ruby|c\+\+|c#|kotlin|swift|php|rust|scala|elixir|haskell)\b/.test(
      s,
    )
  ) {
    return 'languages'
  }
  if (
    /\b(react|vue|angular|svelte|next\.?js|nuxt|django|flask|fastapi|spring|rails|laravel|express|nest\.?js)\b/.test(
      s,
    )
  ) {
    return 'frameworks'
  }
  if (
    /\b(pandas|numpy|scipy|tensorflow|pytorch|keras|matplotlib|lodash|redux)\b/.test(s)
  ) {
    return 'libraries'
  }
  if (
    /\b(docker|kubernetes|k8s|aws|gcp|azure|terraform|ansible|jenkins|ci\/cd|github actions|gitlab|kafka|rabbitmq|redis|postgres|mongodb|mysql|elasticsearch)\b/.test(
      s,
    )
  ) {
    return 'developer_tools'
  }
  return 'developer_tools'
}

function splitSkillPhrase(s: string): string[] {
  return s
    .split(/[,;]|(?:\s+and\s+)/i)
    .map((p) => normalizeWs(p))
    .filter(Boolean)
}

/** Multi-clause suggested lines (e.g. Google XYZ) stay one cell; short comma lists split into tokens. */
function expandSuggestedTokens(toTrim: string): string[] {
  if (toTrim.length > 160 || /\bas measured by\b/i.test(toTrim)) {
    return [toTrim]
  }
  const parts = splitSkillPhrase(toTrim)
  return parts.length > 0 ? parts : [toTrim]
}

function dedupeTokens(tokens: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of tokens) {
    const k = t.toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      out.push(t)
    }
  }
  return out
}

/** Replace first case-insensitive occurrence of needle in haystack. */
function replaceFirstInsensitive(haystack: string, needle: string, replacement: string): string {
  const lowerH = haystack.toLowerCase()
  const lowerN = needle.toLowerCase()
  const idx = lowerH.indexOf(lowerN)
  if (idx === -1) return haystack
  return haystack.slice(0, idx) + replacement + haystack.slice(idx + needle.length)
}

/**
 * Skills feedback often uses resume lines that do not match comma-joined editor fields, or
 * omits original_line for "add X" gaps. Merge into structured `skills` explicitly.
 */
function applySkillsSectionFeedback(resume: StructuredResume, item: FeedbackItem): StructuredResume {
  const toRaw = item.suggested_line
  if (toRaw == null) return resume
  const toTrim = normalizeWs(toRaw)
  if (!toTrim) return resume

  const fromRaw = item.original_line
  const fromTrim = fromRaw != null ? normalizeWs(fromRaw) : ''

  const next = structuredClone(resume) as StructuredResume
  const skillsBefore = JSON.stringify(next.skills)

  if (fromTrim) {
    for (const needle of buildNeedles(fromRaw!)) {
      if (!needle) continue
      for (const key of SKILL_FIELD_KEYS) {
        if (next.skills[key].includes(needle)) {
          next.skills[key] = replaceAll(next.skills[key], needle, toTrim)
          if (JSON.stringify(next.skills) !== skillsBefore) return next
        }
      }
      for (const key of SKILL_FIELD_KEYS) {
        const patched = replaceFirstInsensitive(next.skills[key], needle, toTrim)
        if (patched !== next.skills[key]) {
          next.skills[key] = patched
          return next
        }
      }
    }

    const fromTokens = splitSkillPhrase(fromTrim)
    for (const token of fromTokens) {
      if (!token) continue
      for (const key of SKILL_FIELD_KEYS) {
        const parts = next.skills[key]
          .split(',')
          .map((s) => normalizeWs(s))
          .filter(Boolean)
        const ti = parts.findIndex((p) => p.toLowerCase() === token.toLowerCase())
        if (ti >= 0) {
          const insert = expandSuggestedTokens(toTrim)
          parts.splice(ti, 1, ...insert)
          next.skills[key] = dedupeTokens(parts).join(', ')
          return next
        }
      }
    }
  }

  const target = pickSkillsAppendTarget(toTrim)
  const tokensToAdd = expandSuggestedTokens(toTrim)

  const existing = next.skills[target]
    .split(',')
    .map((s) => normalizeWs(s))
    .filter(Boolean)
  const merged = dedupeTokens([...existing, ...tokensToAdd])
  next.skills[target] = merged.join(', ')

  if (JSON.stringify(next.skills) === skillsBefore) {
    return resume
  }
  return next
}

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
    if (to == null || normalizeWs(to) === '') continue

    const hasFrom = from != null && normalizeWs(from) !== ''
    if (!hasFrom && !isSkillsFeedbackItem(item)) continue

    const beforeItem = JSON.stringify(next)

    if (hasFrom) {
      next = applyOneLineItem(next, item)
    }

    if (JSON.stringify(next) === beforeItem && isSkillsFeedbackItem(item)) {
      next = applySkillsSectionFeedback(next, item)
    }

    if (JSON.stringify(next) === beforeItem) {
      console.warn(
        '[applyAcceptedFeedbackToStructuredResume] original_line not matched in structured resume:',
        item.id,
      )
      unmatchedLineItemIds.push(item.id)
    }
  }

  return { resume: next, unmatchedLineItemIds }
}
