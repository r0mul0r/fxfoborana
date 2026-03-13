'use client'

import { markDeliveredAction } from '@/lib/actions/transactions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Transaction } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export function PendingDeliveries({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter()

  if (transactions.length === 0) return null

  async function handleDeliver(id: string) {
    const result = await markDeliveredAction(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('¡Marcado como entregado!')
      router.refresh()
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-600 mb-3">Por entregar</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {transactions.slice(0, 6).map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {(t.clients as { name: string } | undefined)?.name ?? '—'}
              </p>
              <p className="text-xs text-slate-400">
                ${fmt(t.amount)} {t.currency} · {format(new Date(t.created_at), 'dd MMM', { locale: es })}
              </p>
            </div>
            <button
              onClick={() => handleDeliver(t.id)}
              className="flex-shrink-0 h-9 px-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <CheckCircle2 className="h-4 w-4" />
              Entregado
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
