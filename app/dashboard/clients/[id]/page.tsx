'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ClientDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  
  const [client, setClient] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClientAndTransactions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch client
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (clientData) {
        setClient(clientData)
        
        // Fetch related invoices
        const searchName = clientData.company || clientData.name
        const { data: invData } = await supabase
          .from('invoices')
          .select('*')
          .eq('client_name', searchName)
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          
        if (invData) setInvoices(invData)
      }
      setLoading(false)
    }

    if (id) fetchClientAndTransactions()
  }, [id])

  if (loading) return <div>Loading client details...</div>
  if (!client) return <div>Client not found.</div>

  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/clients" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Clients
        </Link>
      </div>

      <div className="flex gap-6 items-start" style={{ flexWrap: 'wrap' }}>
        {/* Client Summary Card */}
        <div className="dash-card" style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
            {client.company || client.name}
          </h1>
          <p className="text-muted mb-6">{client.company ? client.name : ''}</p>
          
          <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {client.email && <div><strong>Email:</strong> {client.email}</div>}
            {client.phone && <div><strong>Phone:</strong> {client.phone}</div>}
            {client.gstin && <div><strong>GSTIN:</strong> {client.gstin}</div>}
            <div><strong>Total Invoices:</strong> {invoices.length}</div>
            <div style={{ color: '#0F172A', fontSize: '1.1rem', marginTop: '8px' }}>
              <strong>Total Billed:</strong> ₹{totalBilled.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="dash-card" style={{ flex: 2, minWidth: '400px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Transaction History</h2>
            <Link href="/dashboard/invoices/new" className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>
              + New Invoice
            </Link>
          </div>
          
          {invoices.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              No transactions found for this client.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Date</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Invoice #</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Amount</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 20px', fontSize: '0.9rem' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 500, fontSize: '0.9rem' }}>{inv.invoice_number}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 500, fontSize: '0.9rem' }}>₹{inv.total?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <Link href={`/dashboard/invoices/new?id=${inv.id}`} className="text-muted" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
