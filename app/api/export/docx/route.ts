import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyRewriteDiff } from '@/lib/applyRewriteDiff'
import { structureResume } from '@/lib/gemini'
import { buildDocx } from '@/lib/resumeDocx'
import {
  RewriteResultSchema,
  type ExportDocxRequest,
  type ExportPdfErrorResponse,
} from '@/lib/types'

export async function POST(req: NextRequest): Promise<Response> {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ExportDocxRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const diffParsed = RewriteResultSchema.safeParse(body.accepted_diff)
  if (!body.scan_id || !diffParsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: scan } = await supabase
    .from('scans')
    .select('resume_text')
    .eq('id', body.scan_id)
    .eq('user_id', dbUser.id)
    .single()

  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  const { text: mergedText } = applyRewriteDiff(scan.resume_text as string, diffParsed.data)

  let structured
  try {
    structured = await structureResume(mergedText)
  } catch (err) {
    console.error('structureResume error:', err)
    return NextResponse.json(
      { error: 'Failed to structure resume. Please try again.' },
      { status: 500 },
    )
  }

  let docxBuffer: Buffer
  try {
    docxBuffer = await buildDocx(structured)
  } catch (err) {
    console.error('buildDocx error:', err)
    return NextResponse.json(
      { error: 'Failed to build DOCX. Please try again.' } satisfies ExportPdfErrorResponse,
      { status: 500 },
    )
  }

  return new Response(new Uint8Array(docxBuffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="resume.docx"',
    },
  })
}
