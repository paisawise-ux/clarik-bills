import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { userId, tier } = await req.json()

  // Verify caller is admin
  const adminCookie = req.cookies.get('clarik_admin')
  if (adminCookie?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { tier }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
