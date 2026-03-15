import Link from 'next/link'
import { Plus } from 'lucide-react'
import { P2POrdersList } from '@/components/p2p/p2p-orders-list'

export default function P2PPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">P2P Binance</h1>
          <p className="text-sm text-slate-400">Cálculo de ganancias</p>
        </div>
        <Link
          href="/p2p/new"
          className="h-10 px-4 bg-amber-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          Nueva orden
        </Link>
      </div>

      <P2POrdersList />
    </div>
  )
}
