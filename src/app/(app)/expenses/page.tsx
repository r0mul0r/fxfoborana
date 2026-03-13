import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { startOfDay, startOfWeek, startOfMonth, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { ExpenseDeleteButton } from '@/components/expenses/expense-delete-button'
import type { Expense } from '@/types'

const PAGE_SIZE = 10

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  comida:          { label: 'Comida',          emoji: '🍔', color: 'bg-orange-50 text-orange-700' },
  transporte:      { label: 'Transporte',      emoji: '🚗', color: 'bg-blue-50 text-blue-700' },
  servicios:       { label: 'Servicios',       emoji: '💡', color: 'bg-yellow-50 text-yellow-700' },
  entretenimiento: { label: 'Entretenimiento', emoji: '🎮', color: 'bg-purple-50 text-purple-700' },
  salud:           { label: 'Salud',           emoji: '💊', color: 'bg-green-50 text-green-700' },
  otro:            { label: 'Otro',            emoji: '📦', color: 'bg-slate-100 text-slate-600' },
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const dayStart   = startOfDay(now).toISOString()
  const weekStart  = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
  const monthStart = startOfMonth(now).toISOString()

  // Stats: fetch all for current month (efficient enough for personal use)
  const { data: allMonth } = await supabase
    .from('expenses')
    .select('amount, created_at')
    .eq('user_id', user!.id)
    .gte('created_at', monthStart)
    .order('created_at', { ascending: false })

  const monthExpenses = allMonth ?? []
  const dayTotal   = monthExpenses.filter(e => e.created_at >= dayStart).reduce((s, e) => s + Number(e.amount), 0)
  const weekTotal  = monthExpenses.filter(e => e.created_at >= weekStart).reduce((s, e) => s + Number(e.amount), 0)
  const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)

  // Paginated history
  const { data: expenses, count } = await supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const items: Expense[] = expenses ?? []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gastos personales</h1>
          <p className="text-sm text-slate-400">{count ?? 0} registros en total</p>
        </div>
        <Link
          href="/expenses/new"
          className="h-10 px-4 bg-rose-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </Link>
      </div>

      {/* Stats */}
      <div className="bg-rose-500 rounded-2xl p-5 text-white">
        <p className="text-rose-200 text-sm font-medium">Gasto hoy</p>
        <p className="text-4xl font-bold mt-1 tabular-nums">${fmt(dayTotal)}</p>
        <div className="mt-4 pt-4 border-t border-rose-400 grid grid-cols-2 gap-4">
          <div>
            <p className="text-rose-200 text-xs">Esta semana</p>
            <p className="text-white font-bold text-lg tabular-nums">${fmt(weekTotal)}</p>
          </div>
          <div>
            <p className="text-rose-200 text-xs">Este mes</p>
            <p className="text-white font-bold text-lg tabular-nums">${fmt(monthTotal)}</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 mb-3">Historial</h2>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm py-16 text-center">
            <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Receipt className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">Sin gastos aún</p>
            <p className="text-slate-400 text-sm mt-1">Registra tu primer gasto</p>
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-2 mt-5 h-11 px-6 bg-rose-500 text-white rounded-xl text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Registrar gasto
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {items.map((expense) => {
                const meta = CATEGORY_META[expense.category] ?? CATEGORY_META.otro
                return (
                  <div key={expense.id} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0">
                    {/* Category icon */}
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${meta.color}`}>
                      {meta.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(expense.created_at), 'dd MMM · HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <p className="text-base font-bold text-rose-500">-${fmt(expense.amount)}</p>
                      <ExpenseDeleteButton id={expense.id} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Link
                  href={page > 1 ? `/expenses?page=${page - 1}` : '#'}
                  aria-disabled={page <= 1}
                  className={`flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-medium transition-colors ${
                    page <= 1
                      ? 'text-slate-300 pointer-events-none'
                      : 'bg-white shadow-sm text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Link>

                <span className="text-sm text-slate-500">
                  Página <span className="font-semibold text-slate-800">{page}</span> de{' '}
                  <span className="font-semibold text-slate-800">{totalPages}</span>
                </span>

                <Link
                  href={page < totalPages ? `/expenses?page=${page + 1}` : '#'}
                  aria-disabled={page >= totalPages}
                  className={`flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-medium transition-colors ${
                    page >= totalPages
                      ? 'text-slate-300 pointer-events-none'
                      : 'bg-white shadow-sm text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
