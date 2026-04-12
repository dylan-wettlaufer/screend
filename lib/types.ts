import { z } from 'zod'

export type ScanMode = 'general' | 'job_match'

export interface ScanInsert {
  user_id: string
  mode: ScanMode
  role_track?: string | null
  resume_text: string
  resume_file_path: string | null
}

export const FeedbackItemSchema = z.object({
  id: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  section: z.string(),
  title: z.string(),
  description: z.string(),
  reasoning: z.string().optional(),
  original_line: z.string().nullable(),
  suggested_line: z.string().nullable(),
})

export type FeedbackItem = z.infer<typeof FeedbackItemSchema>

/** One improvement row inside `sections.*.improvements` (no `section` field — key comes from parent). */
export const SectionImprovementSchema = z.object({
  id: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  reasoning: z.string().optional(),
  original_line: z.string().nullable(),
  suggested_line: z.string().nullable(),
})

export type SectionImprovement = z.infer<typeof SectionImprovementSchema>

export const SectionAuditSchema = z.object({
  status: z.enum(['optimized', 'needs_improvement']),
  strengths: z.array(z.string()),
  improvements: z.array(SectionImprovementSchema),
})

export type SectionAudit = z.infer<typeof SectionAuditSchema>

export const SectionDiagnosticsSchema = z.object({
  header: SectionAuditSchema,
  experience: SectionAuditSchema,
  projects: SectionAuditSchema,
  skills: SectionAuditSchema,
  education: SectionAuditSchema,
})

export type SectionDiagnostics = z.infer<typeof SectionDiagnosticsSchema>

export const SECTION_DIAGNOSTIC_KEYS = [
  'header',
  'experience',
  'projects',
  'skills',
  'education',
] as const

export type SectionDiagnosticKey = (typeof SECTION_DIAGNOSTIC_KEYS)[number]

export const SECTION_DIAGNOSTIC_LABELS: Record<SectionDiagnosticKey, string> = {
  header: 'Header',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  education: 'Education',
}

export function flattenSectionDiagnosticsToFeedback(sections: SectionDiagnostics): FeedbackItem[] {
  const out: FeedbackItem[] = []
  for (const key of SECTION_DIAGNOSTIC_KEYS) {
    const label = SECTION_DIAGNOSTIC_LABELS[key]
    for (const imp of sections[key].improvements) {
      out.push({ ...imp, section: label })
    }
  }
  return out
}

const scanScoresSchema = z.object({
  ats: z.number().int().min(0).max(20),
  content: z.number().int().min(0).max(20),
  writing: z.number().int().min(0).max(20),
  job_match: z.number().int().min(0).max(20),
  ready: z.number().int().min(0).max(20),
})

/** Job-match Gemini response: `sections` only; flattened `feedback` is derived. */
export const RawJobMatchScanResultSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  scores: scanScoresSchema,
  sections: SectionDiagnosticsSchema,
  keywords_matched: z.array(z.string()),
  keywords_missing: z.array(z.string()),
  jd_title: z.string().nullable(),
  jd_company: z.string().nullable(),
})

export type RawJobMatchScanResult = z.infer<typeof RawJobMatchScanResultSchema>

export const ScanResultSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  scores: scanScoresSchema,
  feedback: z.array(FeedbackItemSchema),
  keywords_matched: z.array(z.string()),
  keywords_missing: z.array(z.string()),
  jd_title: z.string().nullable(),
  jd_company: z.string().nullable(),
  sections: SectionDiagnosticsSchema.optional(),
})

export type ScanResult = z.infer<typeof ScanResultSchema>

export function normalizeJobMatchScanResult(raw: RawJobMatchScanResult): ScanResult {
  const feedback = flattenSectionDiagnosticsToFeedback(raw.sections)
  return {
    overall_score: raw.overall_score,
    scores: raw.scores,
    feedback,
    keywords_matched: raw.keywords_matched,
    keywords_missing: raw.keywords_missing,
    jd_title: raw.jd_title,
    jd_company: raw.jd_company,
    sections: raw.sections,
  }
}

export interface AnalyzeResponse {
  scan_id: string
}

export interface AnalyzeErrorResponse {
  error: string
}

export const RewriteDiffItemSchema = z.object({
  section: z.string(),
  original_line: z.string(),
  revised_line: z.string(),
})

export type RewriteDiffItem = z.infer<typeof RewriteDiffItemSchema>

export const RewriteResultSchema = z.array(RewriteDiffItemSchema)

export const StructuredResumeSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  linkedin: z.string(),
  github: z.string(),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      honors: z.string(),
      coursework: z.string(),
    }),
  ),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      technologies: z.string(),
      start: z.string(),
      end: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  skills: z.object({
    // Using .default("") prevents crashes if the AI misses a category
    languages: z.string().default(""),
    frameworks: z.string().default(""),
    developer_tools: z.string().default(""),
    libraries: z.string().default(""),
  }),
})

export type StructuredResume = z.infer<typeof StructuredResumeSchema>

export const StructuredResumeSaveRequestSchema = z.object({
  structured_resume: StructuredResumeSchema,
})

export type StructuredResumeSaveRequest = z.infer<typeof StructuredResumeSaveRequestSchema>

export interface StructuredResumeSaveErrorResponse {
  error: string
}

export interface ExportPdfRequest {
  scan_id: string
  /** Required when `structured_resume` is omitted (legacy merge + AI structure path). */
  accepted_diff?: RewriteDiffItem[]
  /** When set, skips merge + AI structure; must match current template shape */
  structured_resume?: StructuredResume
}

export interface ExportDocxRequest {
  scan_id: string
  accepted_diff: RewriteDiffItem[]
  structured_resume?: StructuredResume
}

export interface ExportPdfErrorResponse {
  error: string
  details?: string
}

export interface ScanRecord {
  id: string
  mode: ScanMode
  role_track: string | null
  resume_text: string
  resume_file_path: string | null
  jd_text: string | null
  overall_score: number
  score_ats: number
  score_content: number
  score_writing: number
  score_job_match: number
  score_ready: number
  feedback_json: FeedbackItem[]
  keywords_matched: string[]
  keywords_missing: string[]
  jd_title: string | null
  jd_company: string | null
  created_at: string
  /** Set at analyze time from structureResume(); null for legacy rows or parse failures */
  structured_resume_json?: StructuredResume | null
  /** Job-match section audit (strengths, status, improvements); null for legacy or general scans */
  section_diagnostics_json?: SectionDiagnostics | null
}
