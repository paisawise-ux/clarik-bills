import { createAdminClient } from '@/lib/supabase/admin'

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: '#111113',
      border: '1px solid #1F1F23',
      borderRadius: '12px',
      padding: '24px',
      borderTop: accent ? `3px solid ${accent}` : undefined
    }}>
      <div style={{ color: '#6B7280', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>
        {value}
      </div>
      {sub && <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>{sub}</div>}
    </div>
  )
}

export default async function AdminOverview() {
  const supabase = createAdminClient()

  const [
    { data: allUsers },
    { data: recentInvoices },
    { data: revenueData },
  ] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('invoices').select('*').is('deleted_at', null).order('created_at', { ascending: false }).limit(10),
    supabase.from('invoices').select('total, created_at').is('deleted_at', null),
  ])

  const users = allUsers?.users || []
  const proUsers = users.filter(u => u.user_metadata?.tier === 'pro').length
  const businessUsers = users.filter(u => u.user_metadata?.tier === 'business').length
  const freeUsers = users.length - proUsers - businessUsers
  const mrr = (proUsers * 299) + (businessUsers * 799)
  const totalRevenue = revenueData?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  // Recent signups (last 5)
  const recentUsers = [...users].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5)

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>Command Center</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Real-time overview of Clarik Bills platform</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Users" value={users.length.toString()} sub="All time signups" accent="#6366F1" />
        <StatCard label="Pro Subscribers" value={proUsers.toString()} sub="₹299/mo each" accent="#10B981" />
        <StatCard label="Business" value={businessUsers.toString()} sub="₹799/mo each" accent="#F59E0B" />
        <StatCard label="Free Users" value={freeUsers.toString()} sub="Unpaid tier" />
        <StatCard label="Est. MRR" value={`₹${mrr.toLocaleString('en-IN')}`} sub="Monthly recurring" accent="#8B5CF6" />
        <StatCard label="Total Revenue Billed" value={`₹${Math.round(totalRevenue).toLocaleString('en-IN')}`} sub="Across all invoices" />
        <StatCard label="Total Invoices" value={(recentInvoices?.length ?? 0).toString()} sub="Active (not deleted)" />
      </div>

      {/* Recent Users & Invoices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Recent Signups */}
        <div style={{ background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: '#E5E7EB' }}>Recent Signups</h2>
          {recentUsers.map(user => (
            <div key={user.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #1F1F23'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'white', marginBottom: '2px' }}>
                  {user.email}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {new Date(user.created_at).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span style={{
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: user.user_metadata?.tier === 'pro' ? 'rgba(16,185,129,0.15)' :
                  user.user_metadata?.tier === 'business' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)',
                color: user.user_metadata?.tier === 'pro' ? '#10B981' :
                  user.user_metadata?.tier === 'business' ? '#F59E0B' : '#9CA3AF'
              }}>
                {user.user_metadata?.tier || 'free'}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Invoices */}
        <div style={{ background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: '#E5E7EB' }}>Recent Invoices</h2>
          {(recentInvoices || []).slice(0, 5).map((inv: any) => (
            <div key={inv.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #1F1F23'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'white', marginBottom: '2px' }}>
                  {inv.invoice_number} · {inv.client_name || 'Walk-in'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {new Date(inv.created_at).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span style={{ color: '#A5B4FC', fontWeight: 600, fontSize: '0.85rem' }}>
                ₹{Math.round(inv.total || 0).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
