'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalGST: 0,
    invoiceCount: 0
  })
  
  const supabase = createClient()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (data) {
      setInvoices(data)
      const revenue = data.reduce((sum, inv) => sum + (inv.total || 0), 0)
      const gst = data.reduce((sum, inv) => sum + (inv.gst_amount || 0), 0)
      
      setStats({
        totalRevenue: revenue,
        totalGST: gst,
        invoiceCount: data.length
      })
    }
    setLoading(false)
  }

  const downloadCSV = () => {
    if (invoices.length === 0) return alert('No invoices to download.')
    
    // Headers
    let csv = 'Invoice Number,Date,Client Name,Client GSTIN,Subtotal,GST Amount,Total\n'
    
    // Rows
    invoices.forEach(inv => {
      const date = new Date(inv.created_at).toLocaleDateString()
      csv += `${inv.invoice_number},${date},"${inv.client_name}",${inv.client_gstin || ''},${inv.subtotal},${inv.gst_amount},${inv.total}\n`
    })
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'GSTR-1_Report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Tax & Revenue Reports</h1>
        <button onClick={downloadCSV} className="btn btn-secondary">Download GSTR-1 Excel (CSV)</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="dash-card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <h3 className="text-muted mb-2">Total Revenue Billed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="dash-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <h3 className="text-muted mb-2">Total GST Collected</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>₹{stats.totalGST.toLocaleString('en-IN')}</p>
        </div>
        <div className="dash-card" style={{ borderLeft: '4px solid #10B981' }}>
          <h3 className="text-muted mb-2">Invoices Generated</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.invoiceCount}</p>
        </div>
      </div>

      <div className="dash-card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>Monthly Breakdown</h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
          <p className="text-muted">Create more invoices to see your monthly chart data.</p>
        </div>
      </div>
    </div>
  )
}
