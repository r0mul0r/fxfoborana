import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { P2POrdersList } from '@/components/p2p/p2p-orders-list'
import type { P2POrderDB } from '@/types'

export default async function P2PPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { from, to } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('p2p_orders')
    .select('*, p2p_operations(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (from) query = query.gte('created_at', `${from}T00:00:00`)
  if (to)   query = query.lte('created_at', `${to}T23:59:59`)

  const { data } = await query
  const orders: P2POrderDB[] = data ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">P2P Binance</h1>
          <p className="text-sm text-slate-400">{orders.length} orden{orders.length !== 1 ? 'es' : ''}</p>
        </div>
        <Link
          href="/p2p/new"
          className="h-10 px-4 bg-amber-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          Nueva orden
        </Link>
      </div>

      <DateRangeFilter from={from} to={to} />

      <P2POrdersList orders={orders} />
    </div>
  )
}
