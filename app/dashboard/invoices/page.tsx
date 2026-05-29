'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (data) setInvoices(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Move this invoice to Trash?')) {
      await supabase.from('invoices').update({ deleted_at: new Date().toISOString() }).eq('id', id)
      fetchInvoices()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Invoices</h1>
        <Link href="/dashboard/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>

      {loading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <div className="dash-card text-center py-10" style={{ maxWidth: '500px', margin: '40px auto' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', background: 'var(--border-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>No invoices found</h3>
          <p className="text-muted mb-6">Create your first GST invoice to get started.</p>
          <Link href="/dashboard/invoices/new" className="btn btn-primary">Create Invoice</Link>
        </div>
      ) : (
        <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Date</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Invoice #</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Client</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Total Amount</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px', fontSize: '0.95rem' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{inv.invoice_number}</td>
                  <td style={{ padding: '16px' }}>{inv.client_name}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>₹{inv.total?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Link href={`/dashboard/invoices/new?id=${inv.id}`} className="btn-ghost" style={{ padding: '6px 12px', marginRight: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}>
                      Edit / View
                    </Link>
                    <button onClick={() => handleDelete(inv.id)} className="btn-ghost" style={{ padding: '6px 12px', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '0.85rem', background: '#FEF2F2' }}>
                      Delete
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
