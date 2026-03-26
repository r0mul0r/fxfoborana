import { createClient } from '@/lib/supabase/server'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Banknote, CheckCircle2, CircleDot } from 'lucide-react'

const PAGE_SIZE = 15

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

type AbonoEntry = {
  id: string
  tipo: 'abono' | 'entrega'
  cliente: string
  monto: number
  moneda: string
  nota: string | null
  fecha: string
}

export default async function AbonosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>
}) {
  const { from, to, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ── 1. Partial payments ──────────────────────────────────────────────────
  let paymentsQ = supabase
    .from('payments')
    .select('id, amount, notes, created_at, transactions(currency, clients(name))')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (from) paymentsQ = paymentsQ.gte('created_at', `${from}T00:00:00`)
  if (to)   paymentsQ = paymentsQ.lte('created_at', `${to}T23:59:59`)

  const { data: rawPayments } = await paymentsQ
  const partials = ((rawPayments ?? []) as unknown as {
    id: string
    amount: number
    notes: string | null
    created_at: string
    transactions: { currency: string; clients: { name: string } | null } | null
  }[]).map<AbonoEntry>((p) => ({
    id: p.id,
    tipo: 'abono',
    cliente: p.transactions?.clients?.name ?? '—',
    monto: Number(p.amount),
    moneda: p.transactions?.currency ?? '—',
    nota: p.notes,
    fecha: p.created_at,
  }))

  // ── 2. Transaction IDs that already have at least one payment entry ───────
  const { data: txWithPayments } = await supabase
    .from('payments')
    .select('transaction_id')
    .eq('user_id', user!.id)

  const paidTxIds = new Set((txWithPayments ?? []).map((p) => p.transaction_id))

  // ── 3. Delivered transactions with NO payment entries ────────────────────
  //    (client paid in full in one go / marked delivered directly)
  let deliveredQ = supabase
    .from('transactions')
    .select('id, amount, currency, notes, created_at, delivered_at, clients(name)')
    .eq('user_id', user!.id)
    .eq('status', 'delivered')
    .order('created_at', { ascending: false })

  if (from) deliveredQ = deliveredQ.gte('created_at', `${from}T00:00:00`)
  if (to)   deliveredQ = deliveredQ.lte('created_at', `${to}T23:59:59`)

  const { data: rawDelivered } = await deliveredQ
  const fullDeliveries = ((rawDelivered ?? []) as unknown as {
    id: string
    amount: number
    currency: string
    notes: string | null
    created_at: string
    delivered_at: string | null
    clients: { name: string } | null
  }[])
    .filter((tx) => !paidTxIds.has(tx.id))
    .map<AbonoEntry>((tx) => ({
      id: tx.id,
      tipo: 'entrega',
      cliente: tx.clients?.name ?? '—',
      monto: Number(tx.amount),
      moneda: tx.currency,
      nota: tx.notes,
      fecha: tx.delivered_at ?? tx.created_at,
    }))

  // ── 4. Merge, apply date filter on effective date, sort, paginate ─────────
  const fromDate = from ? startOfDay(parseISO(from)) : null
  const toDate   = to   ? endOfDay(parseISO(to))     : null

  const all = [...partials, ...fullDeliveries]
    .filter((e) => {
      if (!fromDate && !toDate) return true
      const d = parseISO(e.fecha)
      if (fromDate && toDate) return isWithinInterval(d, { start: fromDate, end: toDate })
      if (fromDate) return d >= fromDate
      return d <= toDate!
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

  const total      = all.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const entries    = all.slice(offset, offset + PAGE_SIZE)
  const totalAbonado = all.reduce((acc, e) => acc + e.monto, 0)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to)   params.set('to', to)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/abonos?${qs}` : '/abonos'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Abonos</h1>
          <p className="text-xs text-slate-400 mt-0.5">{total} registro{total !== 1 ? 's' : ''}</p>
        </div>
        {totalAbonado > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Total recibido</p>
            <p className="text-lg font-bold text-emerald-600 tabular-nums">${fmt(totalAbonado)}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <DateRangeFilter from={from} to={to} />

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-14 flex flex-col items-center gap-2">
          <Banknote className="h-8 w-8 text-slate-300" />
          <p className="text-slate-400 text-sm">Sin registros en este período</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-6" />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Cliente
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Monto
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                      Moneda
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                      Nota
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr
                      key={e.id}
                      className={`border-b last:border-0 transition-colors ${
                        i % 2 === 1 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="pl-4 py-3">
                        {e.tipo === 'entrega' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" title="Pago completo" />
                        ) : (
                          <CircleDot className="h-4 w-4 text-amber-400" title="Abono parcial" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{e.cliente}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-emerald-600 tabular-nums">
                          ${fmt(e.monto)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{e.moneda}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                        {e.nota ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400 whitespace-nowrap">
                        {format(parseISO(e.fecha), 'dd MMM yy, HH:mm', { locale: es })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Pago completo
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <CircleDot className="h-3.5 w-3.5 text-amber-400" /> Abono parcial
              </span>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-400">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={pageUrl(page - 1)}
                    className="h-8 w-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-700 tabular-nums min-w-[2rem] text-center">
                  {page}
                </span>
                {page < totalPages ? (
                  <Link
                    href={pageUrl(page + 1)}
                    className="h-8 w-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
