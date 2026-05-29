import { createAdminClient } from '@/lib/supabase/admin'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth is handled by middleware — no redirect needed here

  const supabase = createAdminClient()

  const [
    { data: revenueData },
    { data: allUsers }
  ] = await Promise.all([
    supabase.from('invoices').select('total').is('deleted_at', null),
    supabase.auth.admin.listUsers()
  ])

  const users = allUsers?.users || []
  const totalRevenue = revenueData?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const proUsers = users.filter(u => u.user_metadata?.tier === 'pro').length
  const businessUsers = users.filter(u => u.user_metadata?.tier === 'business').length
  const freeUsers = users.length - proUsers - businessUsers
  const mrr = (proUsers * 299) + (businessUsers * 799)

  const stats = {
    totalUsers: users.length,
    totalInvoices: 0,
    totalRevenue,
    proUsers,
    businessUsers,
    freeUsers,
    mrr
  }

  return <AdminShell stats={stats}>{children}</AdminShell>
}

