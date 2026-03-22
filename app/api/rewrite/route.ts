import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rewriteResume } from '@/lib/gemini'
import type {
  RewriteRequest,
  RewriteResponse,
  RewriteErrorResponse,
  FeedbackItem,
} from '@/lib/types'

export async function POST(
  req: NextRequest
): Promise<NextResponse<RewriteResponse | RewriteErrorResponse>> {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: RewriteRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { scan_id, accepted_feedback_item_ids } = body

  if (!scan_id || !Array.isArray(accepted_feedback_item_ids) || accepted_feedback_item_ids.length === 0) {
    return NextResponse.json(
      { error: 'scan_id and at least one accepted_feedback_item_id are required' },
      { status: 400 }
    )
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
    .select('resume_text, feedback_json')
    .eq('id', scan_id)
    .eq('user_id', dbUser.id)
    .single()

  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  const allFeedback = Array.isArray(scan.feedback_json)
    ? (scan.feedback_json as FeedbackItem[])
    : []

  const acceptedItems = allFeedback.filter((item) =>
    accepted_feedback_item_ids.includes(item.id)
  )

  if (acceptedItems.length === 0) {
    return NextResponse.json(
      { error: 'None of the provided feedback IDs were found on this scan' },
      { status: 400 }
    )
  }

  let diff
  try {
    diff = await rewriteResume(scan.resume_text as string, acceptedItems)
  } catch (err) {
    console.error('Rewrite error:', err)
    return NextResponse.json({ error: 'Rewrite failed, please try again.' }, { status: 500 })
  }

  return NextResponse.json({ diff })
}
