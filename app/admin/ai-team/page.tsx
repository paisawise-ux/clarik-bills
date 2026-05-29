'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { agentList, AgentRole } from '@/lib/ai/agents'

export default function WarRoom() {
  const [activeAgent, setActiveAgent] = useState<AgentRole>('ceo')
  const [threadId, setThreadId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
    api: '/api/admin/ai-chat',
    body: {
      agentId: activeAgent,
      threadId: threadId
    }
  })

  // Fetch permanent history on load
  useEffect(() => {
    fetch('/api/admin/ai-history')
      .then(res => res.json())
      .then(data => {
        setThreadId(data.threadId)
        // Transform DB messages to ai/react format
        const history = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          name: m.agent_name || (m.role === 'user' ? 'You' : 'System')
        }))
        setMessages(history)
      })
  }, [setMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const agent = agentList.find(a => a.id === activeAgent)!

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', margin: '-40px' }}>
      
      {/* Sidebar: Agent List */}
      <div style={{ width: '280px', background: '#111113', borderRight: '1px solid #1F1F23', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '0.85rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '16px', paddingLeft: '8px' }}>
          Executive Team
        </h2>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {agentList.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveAgent(a.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '12px 16px',
                background: activeAgent === a.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: '1px solid',
                borderColor: activeAgent === a.id ? '#2D2D35' : 'transparent',
                borderRadius: '10px',
                cursor: 'pointer', textAlign: 'left',
                marginBottom: '4px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: a.color, boxShadow: `0 0 10px ${a.color}` }} />
              <div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{a.name}</div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>{a.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0A0A0B' }}>
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #1F1F23', background: '#111113', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${agent.color}40, ${agent.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
            {agent.name[0]}
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, marginBottom: '2px' }}>{agent.name}</h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{agent.title}</p>
          </div>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#6B7280', marginTop: '100px' }}>
                Start the war room session. Tag agents like @Nova or @Ledger.
              </div>
            )}
            
            {messages.map((m, i) => {
              const isUser = m.role === 'user'
              const senderColor = isUser ? '#6366F1' : (agentList.find(a => a.id === m.name)?.color || '#8B5CF6')
              const senderName = isUser ? 'You' : (agentList.find(a => a.id === m.name)?.name || m.name || agent.name)
              
              return (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', flexShrink: 0,
                    borderRadius: '8px',
                    background: isUser ? '#2D2D35' : `linear-gradient(135deg, ${senderColor}40, ${senderColor})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.9rem'
                  }}>
                    {isUser ? 'Y' : senderName[0]}
                  </div>
                  
                  {/* Message Content */}
                  <div style={{ flex: 1, paddingTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{senderName}</span>
                      <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>{isUser ? 'Commander' : 'AI Agent'}</span>
                    </div>
                    <div style={{ color: '#D1D5DB', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {m.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid #1F1F23', background: '#111113' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder={`Message ${agent.name} or tag another agent...`}
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: '#1A1A1E',
                  border: '1px solid #2D2D35',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '16px 50px 16px 16px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'none',
                  minHeight: '80px',
                  fontFamily: 'inherit'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (input.trim()) handleSubmit(e as any)
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '12px',
                  width: '32px',
                  height: '32px',
                  background: isLoading ? 'transparent' : '#6366F1',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {isLoading ? '...' : '↑'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
