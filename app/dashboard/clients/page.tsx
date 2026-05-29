'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Client = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  gstin: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Form State
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gstin, setGstin] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setClients(data)
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from('clients').insert({
        user_id: user.id,
        name,
        company,
        email,
        phone,
        gstin
      })
      
      // Reset form & close modal
      setShowModal(false)
      setName(''); setCompany(''); setEmail(''); setPhone(''); setGstin('');
      fetchClients()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await supabase.from('clients').delete().eq('id', id)
      fetchClients()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Clients</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add Client</button>
      </div>

      {loading ? (
        <p>Loading clients...</p>
      ) : clients.length === 0 ? (
        <div className="dash-card text-center py-10">
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '8px' }}>No clients yet</h3>
          <p className="text-muted mb-4">Add clients to easily select them when creating invoices.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">Add Client</button>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {clients.map(client => (
            <div key={client.id} className="dash-card hover-card" style={{ position: 'relative', padding: 0, overflow: 'hidden' }}>
              <button 
                onClick={(e) => { e.preventDefault(); handleDelete(client.id); }}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'white', border: '1px solid #FECACA', borderRadius: '4px', color: '#EF4444', cursor: 'pointer', fontSize: '1rem', padding: '2px 6px', zIndex: 10 }}
                title="Delete Client"
              >
                ✕
              </button>
              
              <Link href={`/dashboard/clients/${client.id}`} style={{ display: 'block', padding: '24px', textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px', paddingRight: '30px' }}>{client.company || client.name}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>{client.name}</p>
                
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  {client.email && <div className="mb-1">📧 {client.email}</div>}
                  {client.phone && <div className="mb-1">📱 {client.phone}</div>}
                  {client.gstin && <div className="mb-1" style={{ color: '#0F172A', fontWeight: 500 }}>GSTIN: {client.gstin}</div>}
                </div>
                
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E2E8F0', color: '#3B82F6', fontSize: '0.85rem', fontWeight: 500 }}>
                  View Transactions →
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Add New Client</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Contact Person Name *</label>
                <input className="form-input" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Company/Business Name</label>
                <input className="form-input" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="form-group flex-1 mb-0">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group flex-1 mb-0">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN (Optional)</label>
                <input className="form-input" placeholder="e.g. 29ABCDE1234F1Z5" value={gstin} onChange={e => setGstin(e.target.value)} />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving || !name} className="btn btn-primary">{saving ? 'Saving...' : 'Save Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
