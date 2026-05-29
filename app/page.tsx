'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="navbar container">
        <div className="nav-logo">
          <div className="logo-circle">C</div>
          <span>Clarik Bills</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="nav-cta">
          <Link href="/login" className="btn btn-primary">Start Free</Link>
        </div>
      </nav>

      <section className="hero container">
        <span className="hero-badge">Built for Indian Businesses 🇮🇳</span>
        <h1 className="hero-title">GST Invoicing.<br />Simplified.</h1>
        <p className="hero-subtitle">Create professional GST invoices in seconds. Auto-calculate CGST, SGST, IGST. Track payments and manage clients effortlessly.</p>
        <div className="hero-actions">
          <Link href="/login" className="btn btn-primary">Create Free Invoice</Link>
          <a href="#features" className="btn btn-secondary">See Features</a>
        </div>
      </section>

      <section id="features" className="features container">
        <h2 className="text-center" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Everything you need to bill clients</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Instant GST Calc</h3>
            <p className="feature-desc">Select 5%, 12%, 18% or 28%. We automatically split into CGST/SGST or IGST based on state.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3 className="feature-title">PDF Export</h3>
            <p className="feature-desc">Download beautiful, professional PDF invoices with your company details in one click.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Client Manager</h3>
            <p className="feature-desc">Save client details once. Auto-fill them in future invoices instantly.</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing container text-center">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Simple, transparent pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3 className="pricing-name">Free</h3>
            <div className="pricing-price">₹0<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <ul className="pricing-features" style={{ textAlign: 'left' }}>
              <li>3 invoices per month</li>
              <li>Basic PDF export</li>
              <li>Save 3 clients</li>
            </ul>
            <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }}>Get Started</Link>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <h3 className="pricing-name">Pro</h3>
            <div className="pricing-price">₹299<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <ul className="pricing-features" style={{ textAlign: 'left' }}>
              <li>Unlimited invoices</li>
              <li>Professional PDF export</li>
              <li>Unlimited clients</li>
              <li>GST Reports (GSTR-1)</li>
            </ul>
            <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>Upgrade to Pro</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 0', marginTop: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>© 2026 Clarik Technologies. All rights reserved.</p>
      </footer>
    </div>
  )
}
