import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { P2POrderForm } from '@/components/p2p/p2p-order-form'

export default function NewP2POrderPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/p2p"
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 w-fit mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          P2P Binance
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Nueva orden P2P</h1>
        <p className="text-sm text-slate-400">Ingresa los datos de la operación</p>
      </div>

      <P2POrderForm />
    </div>
  )
}
