import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyRewriteDiff } from '@/lib/applyRewriteDiff'
import { structureResume } from '@/lib/gemini'
import { buildLatex } from '@/lib/resumeLatex'
import {
  RewriteResultSchema,
  type ExportPdfRequest,
  type ExportPdfErrorResponse,
} from '@/lib/types'

export async function POST(
  req: NextRequest
): Promise<Response> {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ExportPdfRequest
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

  const { text: mergedText, skipped: mergeSkipped } = applyRewriteDiff(
    scan.resume_text as string,
    diffParsed.data,
  )
  if (mergeSkipped.length > 0) {
    console.warn('[export/pdf] applyRewriteDiff skipped (no match in resume_text):', mergeSkipped)
  }

  let structured
  try {
    structured = await structureResume(mergedText)
  } catch (err) {
    console.error('structureResume error:', err)
    return NextResponse.json(
      { error: 'Failed to structure resume. Please try again.' },
      { status: 500 }
    )
  }

  const tex = buildLatex(structured)

  const latexServiceUrl = process.env.LATEX_SERVICE_URL
  if (!latexServiceUrl) {
    return NextResponse.json({ error: 'LaTeX service not configured.' }, { status: 500 })
  }

  let latexRes: Response
  try {
    latexRes = await fetch(`${latexServiceUrl}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tex }),
    })
  } catch (err) {
    console.error('LaTeX service fetch error:', err)
    return NextResponse.json(
      { error: 'Could not reach LaTeX service. Is it running?' },
      { status: 502 }
    )
  }

  if (!latexRes.ok) {
    let details = ''
    try {
      const errBody = (await latexRes.json()) as ExportPdfErrorResponse
      details = errBody.details ?? errBody.error ?? ''
    } catch {
      // ignore JSON parse failure on error body
    }
    console.error('LaTeX compilation failed:', details)
    return NextResponse.json(
      { error: 'PDF compilation failed.', details },
      { status: 500 }
    )
  }

  const pdfBuffer = await latexRes.arrayBuffer()

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
    },
  })
}
