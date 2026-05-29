'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TrashPage() {
  const [deletedInvoices, setDeletedInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDeletedInvoices()
  }, [])

  const fetchDeletedInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    
    if (data) setDeletedInvoices(data)
    setLoading(false)
  }

  const handleRestore = async (id: string) => {
    await supabase.from('invoices').update({ deleted_at: null }).eq('id', id)
    fetchDeletedInvoices()
  }

  const handlePermanentDelete = async (id: string) => {
    if (confirm('Are you sure you want to PERMANENTLY delete this invoice? This cannot be undone.')) {
      await supabase.from('invoices').delete().eq('id', id)
      fetchDeletedInvoices()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Trash</h1>
          <p className="text-muted">Deleted invoices are kept here until you permanently remove them.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading trash...</p>
      ) : deletedInvoices.length === 0 ? (
        <div className="dash-card text-center py-10" style={{ maxWidth: '500px', margin: '40px auto' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', background: 'var(--border-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Trash is empty</h3>
          <p className="text-muted mb-4">No deleted invoices found.</p>
        </div>
      ) : (
        <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Deleted On</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Invoice #</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Client</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedInvoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px', fontSize: '0.95rem' }}>{new Date(inv.deleted_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{inv.invoice_number}</td>
                  <td style={{ padding: '16px' }}>{inv.client_name}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button onClick={() => handleRestore(inv.id)} className="btn-secondary" style={{ padding: '6px 12px', marginRight: '8px', fontSize: '0.85rem' }}>
                      Restore
                    </button>
                    <button onClick={() => handlePermanentDelete(inv.id)} className="btn-ghost" style={{ padding: '6px 12px', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '0.85rem', background: '#FEF2F2' }}>
                      Delete Forever
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
