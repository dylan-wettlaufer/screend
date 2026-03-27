import type { RewriteDiffItem } from '@/lib/types'

export interface ApplyRewriteDiffResult {
  text: string
  skipped: string[]
}

/** Replace the first occurrence of `search` with `replacement`, or null if not found. */
function replaceFirstOccurrence(
  text: string,
  search: string,
  replacement: string,
): string | null {
  const i = text.indexOf(search)
  if (i === -1) return null
  return text.slice(0, i) + replacement + text.slice(i + search.length)
}

const BULLET_PREFIXES = ['● ', '• ', '- ', '– ', '●', '•'] as const

/**
 * Merges accepted diff items into the original resume plain text.
 *
 * Phase 1 — Line-based (pasted / multi-line resumes): for each diff item in order,
 * replace the first unused line whose trim() equals original_line.trim().
 *
 * Phase 2 — Substring fallback (PDF-style inline bullets, few newlines): for any
 * item not applied in phase 1, replace the first occurrence of original_line; if
 * missing, try common bullet prefixes before original_line. First occurrence only
 * per item.
 */
export function applyRewriteDiff(
  resumeText: string,
  diff: RewriteDiffItem[],
): ApplyRewriteDiffResult {
  const lines = resumeText.split('\n')
  const consumedLineIdx = new Set<number>()
  const phase1Done = new Set<number>()

  for (let d = 0; d < diff.length; d++) {
    const item = diff[d]
    const key = item.original_line.trim()
    if (!key) continue

    for (let i = 0; i < lines.length; i++) {
      if (consumedLineIdx.has(i)) continue
      if (lines[i].trim() === key) {
        lines[i] = item.revised_line
        consumedLineIdx.add(i)
        phase1Done.add(d)
        break
      }
    }
  }

  let text = lines.join('\n')
  const skipped: string[] = []

  for (let d = 0; d < diff.length; d++) {
    if (phase1Done.has(d)) continue

    const item = diff[d]
    const original = item.original_line.trim()
    if (!original) continue

    let next = replaceFirstOccurrence(text, original, item.revised_line)
    if (next !== null) {
      text = next
      continue
    }

    let applied = false
    for (const prefix of BULLET_PREFIXES) {
      const search = `${prefix}${original}`
      const replacement = `${prefix}${item.revised_line}`
      next = replaceFirstOccurrence(text, search, replacement)
      if (next !== null) {
        text = next
        applied = true
        break
      }
    }

    if (!applied) {
      skipped.push(original)
    }
  }

  return { text, skipped }
}
