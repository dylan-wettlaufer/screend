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

export interface ScanRecord {
  id: string
  mode: ScanMode
  role_track: string | null
  resume_text: string
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
