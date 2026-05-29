import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminRevenue() {
  const supabase = createAdminClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  // Group by month
  const byMonth: Record<string, number> = {}
  for (const inv of invoices || []) {
    const date = new Date(inv.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = (byMonth[key] || 0) + (inv.total || 0)
  }

  const months = Object.entries(byMonth).slice(-12) // last 12 months
  const maxVal = Math.max(...months.map(([, v]) => v), 1)

  const { data: allUsers } = await supabase.auth.admin.listUsers()
  const users = allUsers?.users || []
  const proUsers = users.filter(u => u.user_metadata?.tier === 'pro').length
  const bizUsers = users.filter(u => u.user_metadata?.tier === 'business').length
  const mrr = proUsers * 299 + bizUsers * 799
  const arr = mrr * 12
  const totalAllTime = (invoices || []).reduce((s, i) => s + (i.total || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>Revenue</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Platform billing and MRR breakdown</p>
      </div>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Est. MRR', value: `₹${mrr.toLocaleString('en-IN')}`, sub: 'Current month recurring', accent: '#6366F1' },
          { label: 'Est. ARR', value: `₹${arr.toLocaleString('en-IN')}`, sub: 'MRR × 12', accent: '#8B5CF6' },
          { label: 'Total Billed (All Time)', value: `₹${Math.round(totalAllTime).toLocaleString('en-IN')}`, sub: 'Sum of all invoices', accent: '#10B981' },
        ].map(card => (
          <div key={card.label} style={{ background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', padding: '24px', borderTop: `3px solid ${card.accent}` }}>
            <div style={{ color: '#6B7280', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', padding: '28px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '24px', color: '#E5E7EB' }}>Monthly Revenue Billed</h2>
        {months.length === 0 ? (
          <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>No invoice data yet.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
            {months.map(([month, value]) => {
              const height = Math.max((value / maxVal) * 180, 4)
              return (
                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>₹{Math.round(value / 1000)}k</div>
                  <div style={{
                    width: '100%',
                    height: `${height}px`,
                    background: 'linear-gradient(180deg, #6366F1, #8B5CF6)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.3s',
                    minHeight: '4px'
                  }} />
                  <div style={{ fontSize: '0.7rem', color: '#6B7280', textAlign: 'center' }}>{month.slice(5)}/{month.slice(2, 4)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Plan breakdown */}
      <div style={{ background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', padding: '24px', marginTop: '24px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: '#E5E7EB' }}>Subscription Breakdown</h2>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Pro', count: proUsers, price: 299, color: '#10B981' },
            { label: 'Business', count: bizUsers, price: 799, color: '#F59E0B' },
          ].map(plan => (
            <div key={plan.label} style={{ flex: 1, padding: '20px', background: '#1A1A1E', borderRadius: '10px', borderLeft: `3px solid ${plan.color}` }}>
              <div style={{ color: plan.color, fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{plan.label}</div>
              <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>{plan.count} users</div>
              <div style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '4px' }}>
                ₹{(plan.count * plan.price).toLocaleString('en-IN')}/mo
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
