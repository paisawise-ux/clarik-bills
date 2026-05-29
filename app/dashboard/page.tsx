'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DashboardOverview() {
  const [stats, setStats] = useState({ invoices: 0, revenue: 0, clients: 0 })
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
          const { count: invoicesCount } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .is('deleted_at', null)
            
          const { count: clientsCount } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          const { data: allInvoices } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

          if (allInvoices) {
            const revenue = allInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
            setStats({
              invoices: invoicesCount || 0,
              clients: clientsCount || 0,
              revenue: revenue
            })
            setRecentInvoices(allInvoices.slice(0, 5))
          }
        } catch (e) {
          console.error("Tables might not be set up yet", e)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Dashboard Overview</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/invoices/new" className="btn btn-primary">+ New Invoice</Link>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="dash-card">
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value">{stats.invoices}</div>
        </div>
        <div className="dash-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{stats.revenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="dash-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{stats.clients}</div>
        </div>
        <div className="dash-card">
          <div className="stat-label">Pending Payments</div>
          <div className="stat-value">₹0</div>
        </div>
      </div>

      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Recent Invoices</h2>
          <Link href="/dashboard/invoices" className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>
            View All
          </Link>
        </div>
        
        {recentInvoices.length === 0 ? (
          <div className="text-center py-10" style={{ maxWidth: '500px', margin: '20px auto' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', background: 'var(--border-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>No invoices yet</h3>
            <p className="text-muted mb-6">Create your first GST invoice to start tracking revenue.</p>
            <Link href="/dashboard/invoices/new" className="btn btn-primary">Create Invoice</Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Date</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Invoice #</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Client</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 20px', fontSize: '0.9rem' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 20px', fontWeight: 500, fontSize: '0.9rem' }}>{inv.invoice_number}</td>
                  <td style={{ padding: '12px 20px', fontSize: '0.9rem' }}>{inv.client_name}</td>
                  <td style={{ padding: '12px 20px', fontWeight: 500, fontSize: '0.9rem' }}>₹{inv.total?.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
