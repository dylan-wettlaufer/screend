import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseResume, isAcceptedMimeType } from '@/lib/parsers'
import { analyzeResume } from '@/lib/gemini'
import type { AnalyzeResponse, AnalyzeErrorResponse, ScanMode } from '@/lib/types'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(
  req: NextRequest
): Promise<NextResponse<AnalyzeResponse | AnalyzeErrorResponse>> {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const mode = (formData.get('mode') as ScanMode | null) ?? 'general'
  const role_track = (formData.get('role_track') as string | null) || null

  let resume_text: string
  let resume_file_path: string | null = null
  let fileBuffer: Buffer | null = null
  let fileMimeType: string | null = null

  // Determine input: text paste or file upload
  const pastedText = formData.get('resume_text')
  if (typeof pastedText === 'string' && pastedText.trim()) {
    resume_text = pastedText.trim()
  } else {
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 5 MB limit' }, { status: 400 })
    }

    const mimeType = file.type
    if (!isAcceptedMimeType(mimeType)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      )
    }

    // Read buffer once — used for both parsing and storage upload
    fileBuffer = Buffer.from(await file.arrayBuffer())
    fileMimeType = mimeType

    try {
      resume_text = await parseResume(fileBuffer, mimeType)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse resume'
      return NextResponse.json({ error: message }, { status: 422 })
    }

    if (!resume_text.trim()) {
      return NextResponse.json(
        { error: 'Could not read resume content. Try a different format.' },
        { status: 422 }
      )
    }
  }

  const supabase = createAdminClient()

  const { data: dbUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()

  if (userError || !dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const scan_id = crypto.randomUUID()

  // Upload original file to Storage if we have one
  if (fileBuffer && fileMimeType) {
    const ext = fileMimeType === 'application/pdf' ? 'pdf' : 'docx'
    const storagePath = `${user.id}/${scan_id}/resume.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, fileBuffer, { contentType: fileMimeType, upsert: false })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    resume_file_path = storagePath
  }

  // Run Gemini analysis
  let aiResult
  try {
    aiResult = await analyzeResume(resume_text, role_track)
  } catch (err) {
    console.error('AI analysis error:', err)
    return NextResponse.json({ error: 'Analysis failed, please try again.' }, { status: 500 })
  }

  const { error: insertError } = await supabase.from('scans').insert({
    id: scan_id,
    user_id: dbUser.id,
    mode,
    role_track,
    resume_text,
    resume_file_path,
    overall_score: aiResult.overall_score,
    score_ats: aiResult.scores.ats,
    score_content: aiResult.scores.content,
    score_writing: aiResult.scores.writing,
    score_job_match: aiResult.scores.job_match,
    score_ready: aiResult.scores.ready,
    feedback_json: aiResult.feedback,
    keywords_matched: aiResult.keywords_matched,
    keywords_missing: aiResult.keywords_missing,
    jd_title: aiResult.jd_title,
    jd_company: aiResult.jd_company,
  })

  if (insertError) {
    console.error('Scan insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save scan' }, { status: 500 })
  }

  return NextResponse.json({ scan_id })
}
