import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, ArrowLeftRight, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TransactionRowActions } from '@/components/transactions/transaction-row-actions'
import type { Transaction } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, clients(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const all: Transaction[] = transactions ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Historial</h1>
          <p className="text-sm text-slate-400">{all.length} operaciones</p>
        </div>
        <Link
          href="/transactions/new"
          className="h-10 px-4 bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          Nueva
        </Link>
      </div>

      {all.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 text-center">
          <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ArrowLeftRight className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">Sin transacciones aún</p>
          <p className="text-slate-400 text-sm mt-1">Registra tu primera compra de divisas</p>
          <Link
            href="/transactions/new"
            className="inline-flex items-center gap-2 mt-5 h-11 px-6 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Registrar compra
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {all.map((tx) => {
            const clientName = (tx.clients as { name: string } | undefined)?.name ?? '—'
            const initials = clientName.slice(0, 2).toUpperCase()

            return (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-600">{initials}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/clients/${tx.client_id}`} className="text-sm font-semibold text-slate-800 truncate">
                      {clientName}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      tx.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {tx.status === 'delivered' ? 'OK' : 'Pend.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>{format(new Date(tx.created_at), 'dd MMM yy · HH:mm', { locale: es })}</span>
                    <span>·</span>
                    <span>{fmt(tx.buy_rate)} / {fmt(tx.market_rate)}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800">${fmt(tx.amount)}</p>
                  <p className="text-xs font-semibold text-emerald-600">${fmt(tx.profit ?? 0)}</p>
                </div>

                <TransactionRowActions transaction={tx} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
