import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminInvoices() {
  const supabase = createAdminClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  const total = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>All Invoices</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
          {invoices?.length || 0} active invoices · ₹{Math.round(total).toLocaleString('en-IN')} total billed
        </p>
      </div>

      <div style={{ background: '#111113', border: '1px solid #1F1F23', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1F1F23' }}>
              {['Invoice #', 'Client', 'Seller', 'GST Type', 'Amount', 'Date'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', color: '#6B7280', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(invoices || []).map((inv: any) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #1A1A1E' }}>
                <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#A5B4FC', fontWeight: 600 }}>
                  {inv.invoice_number}
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#E5E7EB' }}>
                  {inv.client_name || 'Walk-in'}
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#9CA3AF' }}>
                  {inv.seller_name}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: inv.gst_type === 'inter' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
                    color: inv.gst_type === 'inter' ? '#818CF8' : '#10B981'
                  }}>
                    {inv.gst_type === 'inter' ? 'IGST' : 'CGST+SGST'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                  ₹{Math.round(inv.total || 0).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: '#6B7280' }}>
                  {new Date(inv.created_at).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
