'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function InvoiceEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [tier, setTier] = useState<string>('free')
  const [invoiceCount, setInvoiceCount] = useState<number>(0)

  const [invoice, setInvoice] = useState({
    invoiceNumber: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientGSTIN: '',
    clientEmail: '',
    sellerName: 'Your Company Name',
    sellerGSTIN: 'Your GSTIN',
    gstType: 'intra', // intra = CGST+SGST, inter = IGST
    items: [{ id: 1, desc: 'Web Development Services', qty: 1, rate: 50000, gst: 18 }],
    notes: 'Thank you for your business!'
  })

  useEffect(() => {
    const savedProfile = localStorage.getItem('clarik_profile')
    if (savedProfile && !editId) {
      const p = JSON.parse(savedProfile)
      setInvoice(prev => ({
        ...prev,
        sellerName: p.companyName || prev.sellerName,
        sellerGSTIN: p.gstin || prev.sellerGSTIN
      }))
    }

    const fetchClientsAndInvoice = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch User Tier
      if (user.user_metadata?.tier) {
        setTier(user.user_metadata.tier)
      }

      // Fetch invoice count for limits
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null)
      if (count !== null) setInvoiceCount(count)

      // Fetch Clients
      const { data: clientsData } = await supabase.from('clients').select('*').eq('user_id', user.id)
      if (clientsData) setClients(clientsData)

      // Fetch Invoice if Editing, else generate next invoice number
      if (editId) {
        const { data: invData } = await supabase.from('invoices').select('*').eq('id', editId).single()
        if (invData) {
          setInvoice({
            invoiceNumber: invData.invoice_number,
            date: new Date(invData.created_at).toISOString().split('T')[0],
            clientName: invData.client_name,
            clientGSTIN: invData.client_gstin || '',
            clientEmail: invData.client_email || '',
            sellerName: invData.seller_name,
            sellerGSTIN: invData.seller_gstin || '',
            gstType: invData.gst_type || 'intra',
            items: invData.items || [],
            notes: 'Thank you for your business!'
          })
        }
      } else {
        // Auto-increment logic
        const { data: lastInv } = await supabase
          .from('invoices')
          .select('invoice_number')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          
        if (lastInv && lastInv.length > 0) {
          const lastNumStr = lastInv[0].invoice_number
          const match = lastNumStr.match(/(\d+)$/)
          if (match) {
            const num = parseInt(match[1], 10) + 1
            const nextNumStr = lastNumStr.replace(/\d+$/, String(num).padStart(match[1].length, '0'))
            setInvoice(prev => ({ ...prev, invoiceNumber: nextNumStr }))
          }
        }
      }
    }
    fetchClientsAndInvoice()
  }, [editId])

  const handleClientNameChange = (val: string) => {
    let updates = { clientName: val }
    const matched = clients.find(c => (c.company || c.name) === val)
    if (matched) {
      updates = {
        ...updates,
        clientGSTIN: matched.gstin || invoice.clientGSTIN,
        clientEmail: matched.email || invoice.clientEmail
      } as any
    }
    setInvoice(prev => ({ ...prev, ...updates }))
  }

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), desc: '', qty: 1, rate: 0, gst: 18 }]
    }))
  }

  const updateItem = (id: number, field: string, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }))
  }

  const removeItem = (id: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0)
  const totalGST = invoice.items.reduce((sum, item) => sum + (item.qty * item.rate * (item.gst / 100)), 0)
  const grandTotal = subtotal + totalGST

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const payload = {
        user_id: user.id,
        invoice_number: invoice.invoiceNumber,
        client_name: invoice.clientName || 'Walk-in Client',
        client_email: invoice.clientEmail,
        client_gstin: invoice.clientGSTIN,
        seller_name: invoice.sellerName,
        seller_gstin: invoice.sellerGSTIN,
        items: invoice.items,
        subtotal,
        gst_amount: totalGST,
        total: grandTotal,
        gst_type: invoice.gstType
      }

      if (editId) {
        await supabase.from('invoices').update(payload).eq('id', editId)
      } else {
        await supabase.from('invoices').insert(payload)
      }
    }
    setSaving(false)
    router.push('/dashboard/invoices')
  }

  const handleEmailToCustomer = () => {
    if (!invoice.clientEmail) {
      alert("Please enter a client email first!")
      return
    }
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${invoice.sellerName}`)
    const body = encodeURIComponent(`Hi ${invoice.clientName},\n\nPlease find the details for Invoice ${invoice.invoiceNumber} attached.\n\nTotal Amount: ₹${grandTotal.toLocaleString('en-IN')}\n\nBest regards,\n${invoice.sellerName}`)
    window.location.href = `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`
  }

  const isLimitReached = tier === 'free' && invoiceCount >= 3 && !editId

  return (
    <div className="flex gap-4 invoice-wrapper" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Editor Panel */}
      <div className="dash-card no-print" style={{ flex: 1, overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>
          {editId ? 'Edit Invoice' : 'Create Invoice'}
        </h2>
        
        <div style={{ marginBottom: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Your Details (Seller)</h3>
          <div className="form-group mb-2">
            <input className="form-input" placeholder="Your Company Name" value={invoice.sellerName} onChange={e => setInvoice({...invoice, sellerName: e.target.value})} />
          </div>
          <div className="form-group mb-0">
            <input className="form-input" placeholder="Your GSTIN" value={invoice.sellerGSTIN} onChange={e => setInvoice({...invoice, sellerGSTIN: e.target.value})} />
          </div>
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Invoice Details</h3>
        <div className="flex gap-4 mb-4">
          <div className="form-group flex-1">
            <label className="form-label">Invoice Number</label>
            <input className="form-input" value={invoice.invoiceNumber} onChange={e => setInvoice({...invoice, invoiceNumber: e.target.value})} />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={invoice.date} onChange={e => setInvoice({...invoice, date: e.target.value})} />
          </div>
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Client Details</h3>
        
        {/* Datalist for autocomplete */}
        <datalist id="client-list">
          {clients.map(c => <option key={c.id} value={c.company || c.name} />)}
        </datalist>

        <div className="form-group mb-4">
          <label className="form-label">Client Name</label>
          <input 
            className="form-input" 
            list="client-list"
            placeholder="e.g. Acme Corp (Type to search existing or enter new)" 
            value={invoice.clientName} 
            onChange={e => handleClientNameChange(e.target.value)} 
          />
        </div>
        <div className="flex gap-4 mb-6">
          <div className="form-group flex-1 mb-0">
            <label className="form-label">Client Email</label>
            <input type="email" className="form-input" placeholder="client@company.com" value={invoice.clientEmail} onChange={e => setInvoice({...invoice, clientEmail: e.target.value})} />
          </div>
          <div className="form-group flex-1 mb-0">
            <label className="form-label">Client GSTIN</label>
            <input className="form-input" placeholder="Optional" value={invoice.clientGSTIN} onChange={e => setInvoice({...invoice, clientGSTIN: e.target.value})} />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontWeight: 600 }}>Items</h3>
          <select 
            className="form-input" 
            style={{ width: 'auto', padding: '4px 8px' }}
            value={invoice.gstType}
            onChange={e => setInvoice({...invoice, gstType: e.target.value})}
          >
            <option value="intra">Intra-State (CGST + SGST)</option>
            <option value="inter">Inter-State (IGST)</option>
          </select>
        </div>

        {invoice.items.map((item, index) => (
          <div key={item.id} className="flex gap-2 mb-2 items-center" style={{ flexWrap: 'wrap' }}>
            <input className="form-input" style={{ flex: '1 1 180px', minWidth: '180px' }} placeholder="Description" value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} />
            <div className="flex gap-2" style={{ flex: '1 1 auto', minWidth: '250px' }}>
              <input type="number" className="form-input" style={{ flex: 1, minWidth: '60px' }} placeholder="Qty" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} />
              <input type="number" className="form-input" style={{ flex: 2, minWidth: '80px' }} placeholder="Rate" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} />
              <select className="form-input" style={{ flex: 1, minWidth: '70px', padding: '4px' }} value={item.gst} onChange={e => updateItem(item.id, 'gst', Number(e.target.value))}>
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
              <button onClick={() => removeItem(item.id)} className="btn-ghost" style={{ padding: '8px', color: 'red' }}>✕</button>
            </div>
          </div>
        ))}
        <button onClick={addItem} className="btn-secondary mt-2" style={{ width: '100%' }}>+ Add Item</button>

        <div className="mt-6 pt-4" style={{ borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isLimitReached && (
            <div style={{ width: '100%', padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '8px', textAlign: 'center' }}>
              <strong>Free Plan Limit Reached!</strong> You have created 3 invoices this month. 
              <br/><button onClick={() => router.push('/dashboard/billing')} style={{ color: 'var(--danger)', textDecoration: 'underline', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>Upgrade to Pro</button> to unlock unlimited invoices.
            </div>
          )}
          <button onClick={() => window.print()} className="btn-secondary flex-1">
            Print PDF
          </button>
          <button onClick={handleEmailToCustomer} className="btn-secondary flex-1">
            Email Customer
          </button>
          <button onClick={handleSave} disabled={saving || isLimitReached} className="btn-primary" style={{ width: '100%', opacity: isLimitReached ? 0.5 : 1 }}>
            {saving ? 'Saving...' : (editId ? 'Update Invoice' : 'Save Invoice')}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="print-area" style={{ flex: 1, padding: '40px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E2E8F0', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>{invoice.sellerName || '-----'}</h1>
            {invoice.sellerGSTIN && <p style={{ color: '#64748B', fontSize: '0.85rem' }}>GSTIN: {invoice.sellerGSTIN}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '1px' }}>Tax Invoice</h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>#{invoice.invoiceNumber || '-----'}</p>
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Date: {invoice.date}</p>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Billed To</h3>
          <p style={{ fontWeight: 500, color: '#0F172A' }}>{invoice.clientName || '-----'}</p>
          {invoice.clientEmail && <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Email: {invoice.clientEmail}</p>}
          {invoice.clientGSTIN && <p style={{ fontSize: '0.85rem', color: '#64748B' }}>GSTIN: {invoice.clientGSTIN}</p>}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.85rem', color: '#64748B', width: '35%' }}>Description</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', color: '#64748B', width: '12%' }}>Qty</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', color: '#64748B', width: '23%' }}>Rate</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', color: '#64748B', width: '10%' }}>GST</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', color: '#64748B', width: '20%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 8px', wordWrap: 'break-word' }}>{item.desc || '-----'}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', wordWrap: 'break-word' }}>{item.qty}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', wordWrap: 'break-word' }}>{item.rate}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', wordWrap: 'break-word' }}>{item.gst}%</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', wordWrap: 'break-word' }}>₹{(item.qty * item.rate).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {invoice.gstType === 'intra' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
                  <span>CGST</span>
                  <span>₹{(totalGST / 2).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
                  <span>SGST</span>
                  <span>₹{(totalGST / 2).toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
                <span>IGST</span>
                <span>₹{totalGST.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '8px', borderTop: '2px solid #E2E8F0', fontWeight: 700, fontSize: '1.2rem', color: '#0F172A' }}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewInvoice() {
  return (
    <Suspense fallback={<div>Loading invoice editor...</div>}>
      <InvoiceEditor />
    </Suspense>
  )
}
