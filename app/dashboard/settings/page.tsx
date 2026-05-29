'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    companyName: 'Your Company Name',
    gstin: 'Your GSTIN',
    email: '',
    phone: '',
    address: ''
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load from local storage if available
    const savedProfile = localStorage.getItem('clarik_profile')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('clarik_profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="dash-card" style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Business Settings</h1>
      
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label className="form-label">Business Name (Shows on Invoice)</label>
          <input 
            className="form-input" 
            value={profile.companyName} 
            onChange={e => setProfile({...profile, companyName: e.target.value})} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">GSTIN</label>
          <input 
            className="form-input" 
            value={profile.gstin} 
            onChange={e => setProfile({...profile, gstin: e.target.value})} 
          />
        </div>

        <div className="flex gap-4 mb-4">
          <div className="form-group flex-1 mb-0">
            <label className="form-label">Support Email</label>
            <input 
              type="email"
              className="form-input" 
              value={profile.email} 
              onChange={e => setProfile({...profile, email: e.target.value})} 
            />
          </div>
          <div className="form-group flex-1 mb-0">
            <label className="form-label">Phone Number</label>
            <input 
              className="form-input" 
              value={profile.phone} 
              onChange={e => setProfile({...profile, phone: e.target.value})} 
            />
          </div>
        </div>

        <div className="form-group mb-6">
          <label className="form-label">Business Address</label>
          <textarea 
            className="form-input" 
            rows={3}
            value={profile.address} 
            onChange={e => setProfile({...profile, address: e.target.value})} 
          />
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" className="btn btn-primary">Save Settings</button>
          {saved && <span style={{ color: '#10B981', fontWeight: 500 }}>✓ Saved successfully!</span>}
        </div>
      </form>
    </div>
  )
}
