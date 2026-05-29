'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

export default function BillingPage() {
  const [tier, setTier] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserTier()
  }, [])

  const fetchUserTier = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.user_metadata?.tier) {
      setTier(user.user_metadata.tier)
    }
    setLoading(false)
  }

  const handleUpgrade = async (newTier: string) => {
    // Update user metadata in Supabase
    const { error } = await supabase.auth.updateUser({
      data: { tier: newTier }
    })
    
    if (!error) {
      setTier(newTier)
      alert(`Successfully upgraded to ${newTier.toUpperCase()}!`)
    } else {
      alert('Error upgrading account.')
    }
  }

  if (loading) return <div>Loading billing details...</div>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Billing & Plans</h1>
          <p className="text-muted">Manage your subscription and billing details.</p>
        </div>
        <div style={{ padding: '8px 16px', background: 'var(--border-light)', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
          Current Plan: <span style={{ textTransform: 'uppercase', color: 'var(--accent-primary)' }}>{tier}</span>
        </div>
      </div>

      <PayPalScriptProvider options={{ "clientId": "test", currency: "USD" }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Free Tier */}
          <div className="dash-card hover-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Starter</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>Free</div>
            <ul style={{ flex: 1, listStyle: 'none', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '8px' }}>✓ 3 Invoices per month</li>
              <li style={{ marginBottom: '8px' }}>✓ Basic Client Manager</li>
              <li style={{ marginBottom: '8px' }}>✓ Local PDF Export</li>
            </ul>
            <button className="btn-secondary" style={{ width: '100%' }} disabled>
              {tier === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Pro Tier */}
          <div className="dash-card hover-card" style={{ display: 'flex', flexDirection: 'column', border: tier === 'pro' ? '2px solid var(--accent-primary)' : '' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Pro</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>₹299<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>(~$3.99 USD)</p>
            <ul style={{ flex: 1, listStyle: 'none', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '8px' }}>✓ Unlimited Invoices</li>
              <li style={{ marginBottom: '8px' }}>✓ Advanced GST Reports</li>
              <li style={{ marginBottom: '8px' }}>✓ Payment Links</li>
              <li style={{ marginBottom: '8px' }}>✓ No Watermarks</li>
            </ul>
            {tier === 'pro' ? (
              <button className="btn-secondary" style={{ width: '100%' }} disabled>Current Plan</button>
            ) : (
              <div style={{ minHeight: '45px' }}>
                <PayPalButtons 
                  style={{ layout: "horizontal", height: 40 }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [{ amount: { currency_code: "USD", value: "3.99" } }]
                    })
                  }}
                  onApprove={async (data, actions) => {
                    await actions.order?.capture()
                    handleUpgrade('pro')
                  }}
                />
              </div>
            )}
          </div>

          {/* Business Tier */}
          <div className="dash-card hover-card" style={{ display: 'flex', flexDirection: 'column', border: tier === 'business' ? '2px solid var(--accent-primary)' : '' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Business</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>₹799<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>(~$9.99 USD)</p>
            <ul style={{ flex: 1, listStyle: 'none', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '8px' }}>✓ Everything in Pro</li>
              <li style={{ marginBottom: '8px' }}>✓ Multiple Users</li>
              <li style={{ marginBottom: '8px' }}>✓ API Access</li>
              <li style={{ marginBottom: '8px' }}>✓ Priority Support</li>
            </ul>
            {tier === 'business' ? (
              <button className="btn-secondary" style={{ width: '100%' }} disabled>Current Plan</button>
            ) : (
              <div style={{ minHeight: '45px' }}>
                <PayPalButtons 
                  style={{ layout: "horizontal", height: 40 }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [{ amount: { currency_code: "USD", value: "9.99" } }]
                    })
                  }}
                  onApprove={async (data, actions) => {
                    await actions.order?.capture()
                    handleUpgrade('business')
                  }}
                />
              </div>
            )}
          </div>

        </div>
      </PayPalScriptProvider>
    </div>
  )
}
