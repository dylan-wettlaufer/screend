import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createAdminClient()
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get the headers Clerk sends for verification
  const svix_id = req.headers.get('svix-id')
  const svix_timestamp = req.headers.get('svix-timestamp')
  const svix_signature = req.headers.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Verify the webhook came from Clerk
  const payload = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)
  let event: any

  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  // Handle user.created
  if (event.type === 'user.created') {
    const { id, email_addresses } = event.data
    const email = email_addresses?.[0]?.email_address ?? null

    const { error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          clerk_user_id: id,
          email,
          subscription_status: 'inactive',
        },
        { onConflict: 'clerk_user_id' }
      )

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    console.log('User created in Supabase:', id)
  }

  // Handle user.updated (email change etc)
  if (event.type === 'user.updated') {
    const { id, email_addresses } = event.data
    const email = email_addresses?.[0]?.email_address ?? null

    await supabaseAdmin
      .from('users')
      .update({ email })
      .eq('clerk_user_id', id)
  }

  // Handle user.deleted
  if (event.type === 'user.deleted') {
    const { id } = event.data

    // Delete all storage files first
    const { data: scans } = await supabaseAdmin
      .from('scans')
      .select('resume_file_path')
      .eq('user_id', 
        supabaseAdmin
          .from('users')
          .select('id')
          .eq('clerk_user_id', id)
          .single()
      )

    // Delete the user — cascades to scans via FK
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_user_id', id)

    console.log('User deleted from Supabase:', id)
  }

  return NextResponse.json({ received: true })
}