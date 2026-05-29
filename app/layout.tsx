import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clarik Bills — GST Invoicing Simplified',
  description: 'Create professional GST invoices in seconds. Auto-calculate CGST, SGST, IGST. Download PDF. Track payments. Built for Indian freelancers and small businesses.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
