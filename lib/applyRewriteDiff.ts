import type { RewriteDiffItem } from '@/lib/types'

export interface ApplyRewriteDiffResult {
  text: string
  skipped: string[]
}

/**
 * 
 * ApplyRewriteDiff function: It takes the original resume as a single string, 
 * finds each original_line from the diff inside that string, 
 * and swaps it out for the corresponding revised_line — leaving every other line completely untouched. 
 * The result is a new string of the full resume with only those specific lines replaced.

 * Merges a set of accepted diff items into the original resume plain text.
 *
 * Algorithm:
 * - Builds a Map<trimmedOriginal, revisedLine> from `diff` (first occurrence wins
 *   when the same original_line appears more than once in the diff).
 * - Walks resume lines once; replaces the first line whose trimmed value matches
 *   a map key, then removes that key so a second identical line is left as-is.
 * - Unmatched diff items are collected in `skipped` for the caller to log/warn.
 */
export function applyRewriteDiff(
  resumeText: string,
  diff: RewriteDiffItem[],
): ApplyRewriteDiffResult {
  // Build lookup map — first occurrence of each original_line wins.
  const replacements = new Map<string, string>()
  for (const item of diff) {
    const key = item.original_line.trim()
    if (!replacements.has(key)) {
      replacements.set(key, item.revised_line)
    }
  }

  // Track which keys were actually matched during the walk.
  const matched = new Set<string>()

  const lines = resumeText.split('\n')
  const result = lines.map((line) => {
    const trimmed = line.trim()
    if (replacements.has(trimmed) && !matched.has(trimmed)) {
      matched.add(trimmed)
      return replacements.get(trimmed)!
    }
    return line
  })

  // Any key that was never matched goes into skipped.
  const skipped: string[] = []
  for (const key of replacements.keys()) {
    if (!matched.has(key)) {
      skipped.push(key)
    }
  }

  return { text: result.join('\n'), skipped }
}
