import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { getAgent } from '@/lib/ai/agents'
import { createAdminClient } from '@/lib/supabase/admin'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const maxDuration = 60 // Allow longer processing

export async function POST(req: Request) {
  const { messages, agentId, threadId } = await req.json()

  const agent = getAgent(agentId)
  if (!agent) return new Response('Agent not found', { status: 404 })

  const supabase = createAdminClient()

  // Grab the latest business stats to inject reality into the AI
  const [{ data: allUsers }, { data: invoices }] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('invoices').select('total').is('deleted_at', null)
  ])
  
  const usersCount = allUsers?.users?.length || 0
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  const systemContext = `
${agent.systemPrompt}

CURRENT BUSINESS REALITY:
- Total Registered Users: ${usersCount}
- Total Billed Revenue: ₹${Math.round(totalRevenue)}
- Current Goal: $2,000,000 in 3 months.

Act exclusively as ${agent.name} (${agent.title}). Do not break character. 
If the user's message is addressed to another agent (e.g. "@Nova"), you can still chime in if it affects your department, but explicitly state your perspective as ${agent.title}.
  `

  // Format messages for AI SDK
  const formattedMessages = messages.map((m: any) => ({
    role: m.role,
    content: m.content
  }))

  const result = await streamText({
    model: openrouter('anthropic/claude-3-haiku'), // Fast, smart model
    system: systemContext,
    messages: formattedMessages,
    onFinish: async ({ text }) => {
      // Save the AI's response to permanent memory
      if (threadId) {
        await supabase.from('ai_messages').insert({
          thread_id: threadId,
          role: 'assistant',
          agent_name: agent.id,
          content: text
        })
      }
    }
  })

  // Save the user's latest message to permanent memory
  const lastUserMessage = messages[messages.length - 1]
  if (threadId && lastUserMessage?.role === 'user') {
    await supabase.from('ai_messages').insert({
      thread_id: threadId,
      role: 'user',
      content: lastUserMessage.content
    })
  }

  return result.toTextStreamResponse()
}
