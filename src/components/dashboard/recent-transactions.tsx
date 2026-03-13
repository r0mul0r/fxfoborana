import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import type { Transaction } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-600">Recientes</h2>
        <Link href="/transactions" className="text-xs text-emerald-600 font-medium">Ver todas</Link>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {transactions.map((t, i) => (
          <Link
            key={t.id}
            href={`/clients/${t.client_id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-slate-600">
                {((t.clients as { name: string } | undefined)?.name ?? '?').slice(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {(t.clients as { name: string } | undefined)?.name ?? '—'}
              </p>
              <p className="text-xs text-slate-400">
                {format(new Date(t.created_at), 'dd MMM · HH:mm', { locale: es })}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-slate-800">${fmt(t.amount)}</p>
              <p className={`text-xs font-medium ${t.status === 'delivered' ? 'text-emerald-600' : 'text-amber-500'}`}>
                {t.status === 'delivered' ? 'Entregado' : 'Pendiente'}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
