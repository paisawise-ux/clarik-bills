'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check local storage for theme
    const savedTheme = localStorage.getItem('clarik_theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserEmail(user.email || null)
      }
    }
    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light'
    setIsDark(!isDark)
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('clarik_theme', newTheme)
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar no-print">
        <div className="nav-logo" style={{ color: 'var(--text-main)' }}>
          <div className="logo-circle" style={{ background: 'var(--accent-primary)', color: 'var(--bg-body)' }}>C</div>
          <span>Clarik Bills</span>
        </div>

        <nav className="sidebar-links">
          <Link href="/dashboard" className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`}>
             Overview
          </Link>
          <Link href="/dashboard/invoices" className={`sidebar-link ${pathname.includes('/invoices') ? 'active' : ''}`}>
             Invoices
          </Link>
          <Link href="/dashboard/clients" className={`sidebar-link ${pathname.includes('/clients') ? 'active' : ''}`}>
             Clients
          </Link>
          <Link href="/dashboard/reports" className={`sidebar-link ${pathname.includes('/reports') ? 'active' : ''}`}>
             Reports
          </Link>
          <Link href="/dashboard/billing" className={`sidebar-link ${pathname.includes('/billing') ? 'active' : ''}`}>
             Billing
          </Link>
          <Link href="/dashboard/settings" className={`sidebar-link ${pathname.includes('/settings') ? 'active' : ''}`}>
             Settings
          </Link>
          <Link href="/dashboard/trash" className={`sidebar-link ${pathname.includes('/trash') ? 'active' : ''}`}>
             Trash
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {userEmail}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={toggleTheme} className="btn-secondary" style={{ width: '100%', padding: '8px 0', fontSize: '0.85rem', textAlign: 'center' }}>
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
            <button onClick={handleSignOut} className="btn-ghost" style={{ width: '100%', padding: '8px 0', fontSize: '0.85rem', textAlign: 'center' }}>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
