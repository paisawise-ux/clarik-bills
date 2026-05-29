'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { label: 'Overview', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Invoices', href: '/admin/invoices' },
  { label: 'Revenue', href: '/admin/revenue' },
  { label: 'AI War Room', href: '/admin/ai-team' },
]

export default function AdminShell({ children, stats }: {
  children: React.ReactNode
  stats: {
    totalUsers: number
    totalInvoices: number
    totalRevenue: number
    proUsers: number
    businessUsers: number
    freeUsers: number
    mrr: number
  }
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0B',
      display: 'flex',
      fontFamily: "'Inter', sans-serif",
      color: 'white'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: '#111113',
        borderRight: '1px solid #1F1F23',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem'
            }}>C</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Clarik OS</div>
              <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Internal Dashboard</div>
            </div>
          </div>
        </div>

        {/* MRR pill */}
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px'
          }}>
            <div style={{ color: '#9CA3AF', fontSize: '0.75rem', marginBottom: '4px' }}>Est. MRR</div>
            <div style={{ color: '#A5B4FC', fontWeight: 700, fontSize: '1.2rem' }}>
              ₹{stats.mrr.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                color: isActive ? 'white' : '#9CA3AF',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '2px solid #6366F1' : '2px solid transparent',
                transition: 'all 0.15s'
              }}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '0 24px', borderTop: '1px solid #1F1F23', paddingTop: '16px' }}>
          <div style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '8px' }}>
            {stats.freeUsers} free · {stats.proUsers} pro · {stats.businessUsers} biz
          </div>
          <button onClick={handleSignOut} style={{
            background: 'none', border: '1px solid #2D2D35',
            borderRadius: '6px', color: '#9CA3AF',
            padding: '6px 12px', fontSize: '0.8rem',
            cursor: 'pointer', width: '100%'
          }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '40px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
