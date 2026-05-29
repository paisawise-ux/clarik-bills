'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Incorrect password. Access denied.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 800, color: 'white',
            margin: '0 auto 16px'
          }}>C</div>
          <h1 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>
            Clarik Internal OS
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Restricted access — team only</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111113',
          border: '1px solid #1F1F23',
          borderRadius: '16px',
          padding: '32px'
        }}>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
            Enter access password
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '24px' }}>
            This portal is for Clarik team members only.
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1A1A1E',
                border: '1px solid #2D2D35',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
            />

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Verifying...' : 'Access Internal OS →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
