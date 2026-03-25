import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Users, Phone, ChevronRight, ChevronLeft } from 'lucide-react'
import { ClientsSearch } from '@/components/clients/clients-search'

const PAGE_SIZE = 20

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q = '', page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let clientQuery = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('user_id', user!.id)
    .order('name')

  if (q) clientQuery = clientQuery.ilike('name', `%${q}%`)
  clientQuery = clientQuery.range(offset, offset + PAGE_SIZE - 1)

  const { data: clients, count } = await clientQuery
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const visibleIds = (clients ?? []).map((c) => c.id)
  const { data: txCounts } =
    visibleIds.length > 0
      ? await supabase
          .from('transactions')
          .select('client_id, status')
          .eq('user_id', user!.id)
          .in('client_id', visibleIds)
      : { data: [] }

  const countMap: Record<string, { total: number; pending: number }> = {}
  for (const tx of txCounts ?? []) {
    if (!countMap[tx.client_id]) countMap[tx.client_id] = { total: 0, pending: 0 }
    countMap[tx.client_id].total++
    if (tx.status === 'pending') countMap[tx.client_id].pending++
  }

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/clients?${qs}` : '/clients'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-400">{count ?? 0} registrados</p>
        </div>
        <Link
          href="/clients/new"
          className="h-10 px-4 bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </Link>
      </div>

      {/* Search */}
      <ClientsSearch q={q} />

      {!clients || clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 text-center">
          <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          {q ? (
            <>
              <p className="text-slate-600 font-semibold">Sin resultados</p>
              <p className="text-slate-400 text-sm mt-1">No hay clientes con &ldquo;{q}&rdquo;</p>
            </>
          ) : (
            <>
              <p className="text-slate-600 font-semibold">Sin clientes aún</p>
              <p className="text-slate-400 text-sm mt-1">Agrega tu primer cliente para comenzar</p>
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-2 mt-5 h-11 px-6 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Agregar cliente
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {clients.map((client) => {
              const counts = countMap[client.id] ?? { total: 0, pending: 0 }
              const initials = client.name.slice(0, 2).toUpperCase()

              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b last:border-0"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-700">{initials}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{client.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {client.phone && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />{client.phone}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{counts.total} op.</span>
                      {counts.pending > 0 && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {counts.pending} pendiente{counts.pending !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                </Link>
              )
            })}
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
