import { createClient } from '@/lib/supabase/server'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Banknote } from 'lucide-react'

const PAGE_SIZE = 15

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

type PaymentRow = {
  id: string
  amount: number
  notes: string | null
  created_at: string
  transactions: {
    currency: string
    amount: number
    clients: { name: string } | null
  } | null
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

  // Paginated query
  let query = supabase
    .from('payments')
    .select('id, amount, notes, created_at, transactions(currency, amount, clients(name))', { count: 'exact' })
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (from) query = query.gte('created_at', `${from}T00:00:00`)
  if (to)   query = query.lte('created_at', `${to}T23:59:59`)

  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data, count } = await query
  const payments = (data ?? []) as unknown as PaymentRow[]
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // Total amount in period (separate query without pagination)
  let sumQuery = supabase
    .from('payments')
    .select('amount')
    .eq('user_id', user!.id)

  if (from) sumQuery = sumQuery.gte('created_at', `${from}T00:00:00`)
  if (to)   sumQuery = sumQuery.lte('created_at', `${to}T23:59:59`)

  const { data: allAmounts } = await sumQuery
  const totalAbonado = (allAmounts ?? []).reduce((acc, p) => acc + Number(p.amount), 0)

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
          <p className="text-xs text-slate-400 mt-0.5">{count ?? 0} registro{(count ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        {totalAbonado > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Total abonado</p>
            <p className="text-lg font-bold text-emerald-600 tabular-nums">${fmt(totalAbonado)}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <DateRangeFilter from={from} to={to} />

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-14 flex flex-col items-center gap-2">
          <Banknote className="h-8 w-8 text-slate-300" />
          <p className="text-slate-400 text-sm">Sin abonos en este período</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
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
                  {payments.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-b last:border-0 transition-colors ${
                        i % 2 === 1 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.transactions?.clients?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-emerald-600 tabular-nums">
                          ${fmt(Number(p.amount))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                        {p.transactions?.currency ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                        {p.notes ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400 whitespace-nowrap">
                        {format(new Date(p.created_at), 'dd MMM yy, HH:mm', { locale: es })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
