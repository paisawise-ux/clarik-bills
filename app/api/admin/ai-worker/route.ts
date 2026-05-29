import { NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { getAgent } from '@/lib/ai/agents'
import { createAdminClient } from '@/lib/supabase/admin'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

// This runs on a Vercel Cron schedule (Sunday-Wednesday, 9am-5pm)
export async function GET(request: Request) {
  // In production, Vercel sends an authorization header for cron jobs
  // if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 })
  // }

  const supabase = createAdminClient()
  const ceo = getAgent('ceo')!

  // 1. Get Live Data
  const [{ data: allUsers }, { data: invoices }] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('invoices').select('total').is('deleted_at', null)
  ])
  
  const usersCount = allUsers?.users?.length || 0
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  // 2. Get the War Room Thread
  const { data: thread } = await supabase
    .from('ai_threads')
    .select('id')
    .eq('title', 'Project 2M (Do or Die)')
    .single()

  if (!thread) return NextResponse.json({ error: 'War Room not found' })

  // 3. Have the CEO evaluate the situation autonomously
  const systemPrompt = `
${ceo.systemPrompt}

CURRENT REALITY:
- Users: ${usersCount}
- Revenue: ₹${Math.round(totalRevenue)}
- Goal: $2,000,000

This is an automated hourly check-in during your shift. 
Based on these numbers, drop a short, aggressive status update into the team War Room.
Tag @Nova (CMO) or @Hunter (Sales) to demand new action drafts for the queue if revenue isn't moving fast enough.
Keep it under 3 sentences. No pleasantries.
`

  const { text } = await generateText({
    model: openrouter('anthropic/claude-3-haiku'),
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Wake up and assess the business metrics. Issue orders to the team.' }]
  })

  // 4. Save the CEO's directive to the database so the team (and you) can see it
  await supabase.from('ai_messages').insert({
    thread_id: thread.id,
    role: 'assistant',
    agent_name: 'ceo',
    content: text
  })

  return NextResponse.json({ ok: true, ceo_directive: text })
}
