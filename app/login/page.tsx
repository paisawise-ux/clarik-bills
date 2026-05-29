'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })
    
    try {
      if (isSignUp) {
        // Sign Up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        
        // Attempt to log in immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) {
          throw new Error('Account created, but ' + signInError.message + '. Please ensure "Confirm email" is turned OFF in Supabase settings.')
        }
        
        router.push('/dashboard')
      } else {
        // Log In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="nav-logo" style={{ marginBottom: '60px' }}>
          <div className="logo-circle">C</div>
          <span>Clarik Bills</span>
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1 }}>Your GST billing.<br />Sorted.</h1>
        <ul style={{ listStyle: 'none', color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', marginBottom: '40px' }}>
          <li style={{ marginBottom: '16px' }}>✓ Create professional GST invoices in seconds</li>
          <li style={{ marginBottom: '16px' }}>✓ Auto-calculate CGST, SGST, and IGST</li>
          <li style={{ marginBottom: '16px' }}>✓ Manage clients and track overdue payments</li>
        </ul>
        
        {/* Decorative mockup */}
        <div style={{ background: '#1E293B', padding: '24px', borderRadius: '12px', border: '1px solid #334155', maxWidth: '400px', opacity: 0.8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '12px', background: '#3B82F6', borderRadius: '4px' }}></div>
            <div style={{ width: '80px', height: '12px', background: '#475569', borderRadius: '4px' }}></div>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', marginBottom: '8px' }}></div>
          <div style={{ width: '80%', height: '8px', background: '#334155', borderRadius: '4px', marginBottom: '24px' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '24px', background: '#10B981', borderRadius: '4px', opacity: 0.8 }}></div>
            <div style={{ width: '100px', height: '16px', background: '#F8FAFC', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-box">
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p style={{ color: '#64748B', marginBottom: '32px' }}>
            {isSignUp ? 'Sign up to start creating GST invoices.' : 'Sign in to continue to Clarik Bills.'}
          </p>
          
          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@company.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading || !email || !password}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {message.text && (
            <div style={{ 
              marginTop: '20px', 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: message.type === 'success' ? '#DEF7EC' : '#FDE8E8', 
              color: message.type === 'success' ? '#03543F' : '#9B1C1C', 
              fontSize: '0.9rem', 
              textAlign: 'center' 
            }}>
              {message.text}
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#64748B' }}>
            {isSignUp ? 'Already have an account? ' : 'New to Clarik? '}
            <button 
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setMessage({text:'', type:''}); }}
              style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {isSignUp ? 'Sign In' : 'Create a free account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
