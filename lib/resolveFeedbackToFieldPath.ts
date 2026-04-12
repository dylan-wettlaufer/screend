import type { FeedbackItem, StructuredResume } from '@/lib/types'
import { mapFeedbackSectionToDiagnosticKey } from '@/lib/mapFeedbackSectionToDiagnosticKey'

function normalizeForMatch(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLowerCase()
}

/** Score how well a resume line matches feedback original/suggested text. */
function bulletMatchScore(bullet: string, needle: string): number {
  const b = normalizeForMatch(bullet)
  const n = normalizeForMatch(needle)
  if (!n || !b) return 0
  if (b === n) return n.length + 200
  if (b.includes(n)) return Math.min(n.length, 120)
  if (n.includes(b) && b.length >= 10) return b.length
  return 0
}

function collectLineNeedles(item: FeedbackItem): string[] {
  const out: string[] = []
  if (item.original_line?.trim()) out.push(item.original_line.trim())
  if (item.suggested_line?.trim()) out.push(item.suggested_line.trim())
  return out
}

function findBestBulletMatch(
  bullets: string[],
  needles: string[],
): { index: number; score: number } | null {
  if (needles.length === 0) return null
  let bestIdx = 0
  let bestScore = 0
  for (let bi = 0; bi < bullets.length; bi++) {
    for (const needle of needles) {
      const sc = bulletMatchScore(bullets[bi], needle)
      if (sc > bestScore) {
        bestScore = sc
        bestIdx = bi
      }
    }
  }
  if (bestScore >= 8) return { index: bestIdx, score: bestScore }
  return null
}

/**
 * Optional disambiguator from labels like "Experience — Acme" or "Project: Foo".
 */
export function extractSectionEntityHint(section: string): string | null {
  const t = section.trim()
  if (!t) return null
  const emDash = t.match(/[—–|]\s*(.+)$/)
  if (emDash) return emDash[1].trim()
  const colon = t.match(/:\s*(.+)$/)
  if (colon && !/^(experience|projects|skills|education|header)$/i.test(t)) {
    return colon[1].trim()
  }
  return null
}

function companyMatches(hint: string, company: string): boolean {
  const h = normalizeForMatch(hint)
  const c = normalizeForMatch(company)
  if (!h || !c) return false
  return c.includes(h) || h.includes(c)
}

/**
 * Map a suggestion to a `data-field-path` under `experience.*` or `projects.*`
 * by matching original/suggested lines to bullets and optional company/project hints.
 */
export function resolveFeedbackToFieldPath(
  item: FeedbackItem,
  resume: StructuredResume | null,
): string | null {
  if (!resume) return null
  const key = mapFeedbackSectionToDiagnosticKey(item.section)
  const needles = collectLineNeedles(item)
  const entityHint = extractSectionEntityHint(item.section)

  if (key === 'experience') {
    if (needles.length === 0 && entityHint) {
      for (let i = 0; i < resume.experience.length; i++) {
        if (companyMatches(entityHint, resume.experience[i].company)) {
          return `experience.${i}.company`
        }
      }
    }

    const filteredIndices = (): number[] => {
      if (!entityHint) return resume.experience.map((_, i) => i)
      const hits: number[] = []
      for (let i = 0; i < resume.experience.length; i++) {
        if (companyMatches(entityHint, resume.experience[i].company)) hits.push(i)
      }
      return hits.length > 0 ? hits : resume.experience.map((_, i) => i)
    }

    let best: { i: number; bi: number; score: number } | null = null
    for (const i of filteredIndices()) {
      const bm = findBestBulletMatch(resume.experience[i].bullets, needles)
      if (bm && (!best || bm.score > best.score)) {
        best = { i, bi: bm.index, score: bm.score }
      }
    }
    if (best) return `experience.${best.i}.bullets.${best.bi}`

    if (entityHint) {
      for (let i = 0; i < resume.experience.length; i++) {
        const bm = findBestBulletMatch(resume.experience[i].bullets, needles)
        if (bm && (!best || bm.score > best.score)) {
          best = { i, bi: bm.index, score: bm.score }
        }
      }
      if (best) return `experience.${best.i}.bullets.${best.bi}`
    }

    if (entityHint) {
      for (let i = 0; i < resume.experience.length; i++) {
        if (companyMatches(entityHint, resume.experience[i].company)) {
          return `experience.${i}.company`
        }
      }
    }

    return null
  }

  if (key === 'projects') {
    if (needles.length === 0 && entityHint) {
      for (let i = 0; i < resume.projects.length; i++) {
        if (companyMatches(entityHint, resume.projects[i].name)) {
          return `projects.${i}.name`
        }
      }
    }

    const filteredIndices = (): number[] => {
      if (!entityHint) return resume.projects.map((_, i) => i)
      const hits: number[] = []
      for (let i = 0; i < resume.projects.length; i++) {
        if (companyMatches(entityHint, resume.projects[i].name)) hits.push(i)
      }
      return hits.length > 0 ? hits : resume.projects.map((_, i) => i)
    }

    let best: { i: number; bi: number; score: number } | null = null
    for (const i of filteredIndices()) {
      const bm = findBestBulletMatch(resume.projects[i].bullets, needles)
      if (bm && (!best || bm.score > best.score)) {
        best = { i, bi: bm.index, score: bm.score }
      }
    }
    if (best) return `projects.${best.i}.bullets.${best.bi}`

    if (entityHint) {
      for (let i = 0; i < resume.projects.length; i++) {
        const bm = findBestBulletMatch(resume.projects[i].bullets, needles)
        if (bm && (!best || bm.score > best.score)) {
          best = { i, bi: bm.index, score: bm.score }
        }
      }
      if (best) return `projects.${best.i}.bullets.${best.bi}`
    }

    if (entityHint) {
      for (let i = 0; i < resume.projects.length; i++) {
        if (companyMatches(entityHint, resume.projects[i].name)) {
          return `projects.${i}.name`
        }
      }
    }

    return null
  }

  return null
}
