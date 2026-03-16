'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { startOfDay, startOfWeek, startOfMonth, format } from 'date-fns'
import { CalendarDays, X } from 'lucide-react'

type Preset = 'today' | 'week' | 'month'

function todayStr() { return format(new Date(), 'yyyy-MM-dd') }

export function DateRangeFilter({ from: initFrom = '', to: initTo = '' }: { from?: string; to?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [from, setFrom] = useState(initFrom)
  const [to, setTo] = useState(initTo)

  const hasFilter = Boolean(initFrom || initTo)

  function push(f: string, t: string) {
    const params = new URLSearchParams()
    if (f) params.set('from', f)
    if (t) params.set('to', t)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function applyPreset(preset: Preset) {
    const now = new Date()
    const f = format(
      preset === 'today' ? startOfDay(now)
      : preset === 'week' ? startOfWeek(now, { weekStartsOn: 1 })
      : startOfMonth(now),
      'yyyy-MM-dd'
    )
    const t = todayStr()
    setFrom(f)
    setTo(t)
    push(f, t)
  }

  function applyCustom() {
    push(from, to)
  }

  function clearFilter() {
    setFrom('')
    setTo('')
    push('', '')
  }

  // Detect active preset
  const today = todayStr()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const activePreset: Preset | null =
    initFrom === today && initTo === today ? 'today'
    : initFrom === weekStart && initTo === today ? 'week'
    : initFrom === monthStart && initTo === today ? 'month'
    : null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      {/* Quick presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <CalendarDays className="h-4 w-4 text-slate-400 flex-shrink-0" />
        {(['today', 'week', 'month'] as Preset[]).map((p) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`h-7 px-3 rounded-lg text-xs font-semibold transition-colors ${
              activePreset === p
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {p === 'today' ? 'Hoy' : p === 'week' ? 'Esta semana' : 'Este mes'}
          </button>
        ))}
        {hasFilter && (
          <button
            onClick={clearFilter}
            className="ml-auto flex items-center gap-1 h-7 px-3 rounded-lg text-xs font-semibold bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Custom range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <span className="text-slate-300 text-sm">→</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button
          onClick={applyCustom}
          className="h-9 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold flex-shrink-0 active:scale-95 transition-transform"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
