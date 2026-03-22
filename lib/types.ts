export type ScanMode = 'general' | 'job_match'

export interface ScanInsert {
  user_id: string
  mode: ScanMode
  role_track?: string | null
  resume_text: string
  resume_file_path: string
}

export interface AnalyzeResponse {
  scan_id: string
  resume_text: string
}

export interface AnalyzeErrorResponse {
  error: string
}
