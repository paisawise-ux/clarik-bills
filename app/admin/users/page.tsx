'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  const updateTier = async (userId: string, tier: string) => {
    setUpdating(userId)
    await fetch('/api/admin/update-tier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tier })
    })
    await fetchUsers()
    setUpdating(null)
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const tierColor = (tier: string) => {
    if (tier === 'pro') return { bg: 'rgba(16,185,129,0.15)', color: '#10B981' }
    if (tier === 'business') return { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' }
    return { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>Users</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>{users.length} total registered accounts</p>
        </div>
        <input
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: '#111113', border: '1px solid #2D2D35',
            borderRadius: '8px', color: 'white', padding: '10px 16px',
            fontSize: '0.9rem', outline: 'none', width: '240px'
          }}
        />
      </div>

      <div style={{ background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1F1F23' }}>
              {['Email', 'Plan', 'Signed Up', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', color: '#6B7280', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading users...</td></tr>
            ) : filtered.map(user => {
              const tier = user.user_metadata?.tier || 'free'
              const tc = tierColor(tier)
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #1A1A1E' }}>
                  <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#E5E7EB' }}>{user.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: tc.bg, color: tc.color }}>
                      {tier}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#6B7280' }}>
                    {new Date(user.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['free', 'pro', 'business'].map(t => (
                        <button
                          key={t}
                          onClick={() => updateTier(user.id, t)}
                          disabled={tier === t || updating === user.id}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: tier === t ? 'default' : 'pointer',
                            border: '1px solid',
                            borderColor: tier === t ? '#2D2D35' : '#4B5563',
                            background: tier === t ? '#1A1A1E' : 'transparent',
                            color: tier === t ? '#4B5563' : '#9CA3AF',
                            opacity: updating === user.id ? 0.5 : 1,
                            transition: 'all 0.15s'
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
