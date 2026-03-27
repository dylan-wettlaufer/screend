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
  original_line: z.string().nullable(),
  suggested_line: z.string().nullable(),
})

export type FeedbackItem = z.infer<typeof FeedbackItemSchema>

export const ScanResultSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  scores: z.object({
    ats: z.number().int().min(0).max(20),
    content: z.number().int().min(0).max(20),
    writing: z.number().int().min(0).max(20),
    job_match: z.number().int().min(0).max(20),
    ready: z.number().int().min(0).max(20),
  }),
  feedback: z.array(FeedbackItemSchema),
  keywords_matched: z.array(z.string()),
  keywords_missing: z.array(z.string()),
  jd_title: z.string().nullable(),
  jd_company: z.string().nullable(),
})

export type ScanResult = z.infer<typeof ScanResultSchema>

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

export interface RewriteRequest {
  scan_id: string
  accepted_feedback_item_ids: string[]
}

export interface RewriteResponse {
  diff: RewriteDiffItem[]
}

export interface RewriteErrorResponse {
  error: string
}

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

export const StructureResumeRequestSchema = z.object({
  scan_id: z.string(),
  accepted_diff: RewriteResultSchema,
})

export type StructureResumeRequest = z.infer<typeof StructureResumeRequestSchema>

export interface ExportPdfRequest {
  scan_id: string
  accepted_diff: RewriteDiffItem[]
  /** When set, skips merge + AI structure; must match current Jake's template shape */
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
}
