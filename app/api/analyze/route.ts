import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseResume, isAcceptedMimeType } from '@/lib/parsers'
import type { AnalyzeResponse, AnalyzeErrorResponse, ScanInsert, ScanMode } from '@/lib/types'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse | AnalyzeErrorResponse>> {
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

  const mode = (formData.get('mode') as ScanMode | null) ?? 'general'
  const role_track = (formData.get('role_track') as string | null) || null

  // Parse resume text server-side
  let resume_text: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    resume_text = await parseResume(buffer, mimeType)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse resume'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const supabase = createAdminClient()

  // Look up the Supabase user ID from clerk_user_id
  const { data: dbUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()

  if (userError || !dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const scan_id = crypto.randomUUID()
  const ext = mimeType === 'application/pdf' ? 'pdf' : 'docx'
  const storagePath = `${user.id}/${scan_id}/resume.${ext}`

  // Upload original file to Supabase Storage
  const fileBuffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }

  const scanInsert: ScanInsert = {
    user_id: dbUser.id,
    mode,
    role_track,
    resume_text,
    resume_file_path: storagePath,
  }

  const { error: insertError } = await supabase
    .from('scans')
    .insert({ id: scan_id, ...scanInsert })

  if (insertError) {
    console.error('Scan insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save scan' }, { status: 500 })
  }

  return NextResponse.json({ scan_id, resume_text })
}
