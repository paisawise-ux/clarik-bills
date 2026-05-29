import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()

  // Find or create the master War Room thread
  let { data: thread } = await supabase
    .from('ai_threads')
    .select('*')
    .eq('title', 'Project 2M (Do or Die)')
    .single()

  if (!thread) {
    const { data: newThread } = await supabase
      .from('ai_threads')
      .insert({ title: 'Project 2M (Do or Die)' })
      .select()
      .single()
    thread = newThread
  }

  // Fetch all past messages in chronological order
  const { data: messages } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    threadId: thread.id,
    messages: messages || []
  })
}
