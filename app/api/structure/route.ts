import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyRewriteDiff } from '@/lib/applyRewriteDiff'
import { structureResume } from '@/lib/gemini'
import { StructureResumeRequestSchema, StructuredResumeSchema } from '@/lib/types'

export async function POST(req: NextRequest): Promise<Response> {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = StructureResumeRequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { scan_id: scanId, accepted_diff: acceptedDiff } = parsed.data

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
    .eq('id', scanId)
    .eq('user_id', dbUser.id)
    .single()

  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  const { text: mergedText, skipped: mergeSkipped } = applyRewriteDiff(
    scan.resume_text as string,
    acceptedDiff,
  )
  if (mergeSkipped.length > 0) {
    console.warn('[structure] applyRewriteDiff skipped:', mergeSkipped)
  }

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

  const validated = StructuredResumeSchema.safeParse(structured)
  if (!validated.success) {
    console.error('StructuredResume validation:', validated.error)
    return NextResponse.json(
      { error: 'Structured resume validation failed.' },
      { status: 500 },
    )
  }

  return NextResponse.json(validated.data)
}
