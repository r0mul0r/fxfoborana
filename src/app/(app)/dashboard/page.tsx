import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { PendingDeliveries } from '@/components/dashboard/pending-deliveries'
import { startOfDay, startOfWeek, startOfMonth, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Transaction, Payment } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const dayStart   = startOfDay(now).toISOString()
  const weekStart  = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
  const monthStart = startOfMonth(now).toISOString()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, clients(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const all: Transaction[] = transactions ?? []
  const dayTx   = all.filter(t => t.created_at >= dayStart)
  const weekTx  = all.filter(t => t.created_at >= weekStart)
  const monthTx = all.filter(t => t.created_at >= monthStart)
  const pending = all.filter(t => t.status === 'pending')

  // Fetch payments for pending transactions to calculate net amounts
  const pendingIds = pending.map(t => t.id)
  const { data: pendingPayments } = pendingIds.length > 0
    ? await supabase.from('payments').select('*').in('transaction_id', pendingIds)
    : { data: [] }

  const paidMap: Record<string, number> = {}
  for (const p of (pendingPayments as Payment[]) ?? []) {
    paidMap[p.transaction_id] = (paidMap[p.transaction_id] ?? 0) + Number(p.amount)
  }

  const sum = (arr: Transaction[], field: 'amount' | 'profit') =>
    arr.reduce((acc, t) => acc + Number(t[field] ?? 0), 0)

  // pendingAmount discounts what has already been paid (abonado)
  const pendingAmount = pending.reduce(
    (acc, t) => acc + Math.max(0, Number(t.amount) - (paidMap[t.id] ?? 0)), 0
  )

  const stats = {
    totalAmountDay:    sum(dayTx, 'amount'),
    totalAmountWeek:   sum(weekTx, 'amount'),
    totalAmountMonth:  sum(monthTx, 'amount'),
    totalProfitDay:    sum(dayTx, 'profit'),
    totalProfitWeek:   sum(weekTx, 'profit'),
    totalProfitMonth:  sum(monthTx, 'profit'),
    pendingCount:      pending.length,
    pendingAmount,
  }

  const dateLabel = format(now, "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 capitalize">{dateLabel}</h1>
        <p className="text-sm text-slate-400">Resumen de operaciones</p>
      </div>

      <StatsCards stats={stats} />
      <PendingDeliveries transactions={pending} paidMap={paidMap} />
      <RecentTransactions transactions={all.slice(0, 8)} />
    </div>
  )
}
