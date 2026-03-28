import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  StructuredResumeSaveRequestSchema,
  type StructuredResumeSaveErrorResponse,
} from '@/lib/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { id: scanId } = await context.params

  const user = await currentUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' } satisfies StructuredResumeSaveErrorResponse,
      { status: 401 },
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' } satisfies StructuredResumeSaveErrorResponse,
      { status: 400 },
    )
  }

  const parsed = StructuredResumeSaveRequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body' } satisfies StructuredResumeSaveErrorResponse,
      { status: 400 },
    )
  }

  const { structured_resume: structuredResume } = parsed.data

  const supabase = createAdminClient()

  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()

  if (!dbUser) {
    return NextResponse.json(
      { error: 'User not found' } satisfies StructuredResumeSaveErrorResponse,
      { status: 404 },
    )
  }

  const { data: updated, error } = await supabase
    .from('scans')
    .update({ structured_resume_json: structuredResume })
    .eq('id', scanId)
    .eq('user_id', dbUser.id)
    .select('id')

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update scan' } satisfies StructuredResumeSaveErrorResponse,
      { status: 500 },
    )
  }

  if (!updated?.length) {
    return NextResponse.json(
      { error: 'Scan not found' } satisfies StructuredResumeSaveErrorResponse,
      { status: 404 },
    )
  }

  return new NextResponse(null, { status: 204 })
}
