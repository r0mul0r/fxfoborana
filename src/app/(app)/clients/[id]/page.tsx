import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Plus, Phone, Mail, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ClientTransactionActions } from '@/components/clients/client-transaction-actions'
import { EditClientDialog } from '@/components/clients/edit-client-dialog'
import type { Transaction, Payment } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!client) notFound()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('client_id', id)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const txIds = (transactions ?? []).map(t => t.id)

  const { data: allPayments } = txIds.length > 0
    ? await supabase
        .from('payments')
        .select('*')
        .in('transaction_id', txIds)
    : { data: [] }

  // Build a map: transaction_id -> total amount paid
  const paidMap: Record<string, number> = {}
  for (const p of (allPayments as Payment[]) ?? []) {
    paidMap[p.transaction_id] = (paidMap[p.transaction_id] ?? 0) + Number(p.amount)
  }

  const all: Transaction[] = transactions ?? []
  const pending       = all.filter(t => t.status === 'pending')
  const totalAmount   = all.reduce((acc, t) => acc + Number(t.amount), 0)
  const totalProfit   = all.reduce((acc, t) => acc + Number(t.profit ?? 0), 0)
  // "Por entregar" = monto pendiente menos lo ya abonado
  const pendingAmount = pending.reduce((acc, t) => acc + Math.max(0, Number(t.amount) - (paidMap[t.id] ?? 0)), 0)

  const initials = client.name.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-slate-500 active:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        Clientes
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-emerald-700">{initials}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{client.name}</h1>
              {client.phone && (
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" />{client.phone}
                </p>
              )}
              {client.email && (
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" />{client.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <EditClientDialog client={client} />
            <Link
              href={`/transactions/new?client_id=${client.id}`}
              className="h-9 px-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Nueva
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <DollarSign className="h-4 w-4 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900 tabular-nums">${fmt(totalAmount)}</p>
          <p className="text-xs text-slate-400 leading-tight">total comprado</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-emerald-600 tabular-nums">${fmt(totalProfit)}</p>
          <p className="text-xs text-slate-400 leading-tight">ganancia neta</p>
        </div>
        <div className={`rounded-2xl shadow-sm p-3 text-center ${pendingAmount > 0 ? 'bg-amber-50' : 'bg-white'}`}>
          <Clock className={`h-4 w-4 mx-auto mb-1 ${pendingAmount > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
          <p className={`text-lg font-bold tabular-nums ${pendingAmount > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
            ${fmt(pendingAmount)}
          </p>
          <p className="text-xs text-slate-400 leading-tight">por entregar</p>
        </div>
      </div>

{/* Historial */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 mb-3">Historial</h2>
        {all.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm py-10 text-center">
            <p className="text-slate-400 text-sm">Sin transacciones aún</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {all.map((tx) => {
              const paid = paidMap[tx.id] ?? 0
              return (
                <div key={tx.id} className="flex items-start gap-3 px-4 py-4 border-b last:border-0">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-2 ${tx.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">${fmt(tx.amount)} {tx.currency}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tx.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {tx.status === 'delivered' ? 'Entregado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>Compra {fmt(tx.buy_rate)} · Mercado {fmt(tx.market_rate)}</span>
                      <span className="text-emerald-600 font-semibold">${fmt(tx.profit ?? 0)}</span>
                    </div>
<p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(tx.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                    </p>
                    {tx.notes && <p className="text-xs text-slate-400 italic mt-0.5">{tx.notes}</p>}
                  </div>
                  <ClientTransactionActions transaction={tx} amountPaid={paid} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
