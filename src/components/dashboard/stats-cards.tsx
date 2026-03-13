import type { DashboardStats } from '@/types'
import { TrendingUp, Clock } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-3">
      {/* Card principal — HOY */}
      <div className="bg-emerald-600 rounded-2xl p-5 text-white">
        <p className="text-emerald-200 text-sm font-medium">Ganancia hoy</p>
        <p className="text-4xl font-bold mt-1 tabular-nums">${fmt(stats.totalProfitDay)}</p>
        <p className="text-emerald-300 text-xs mt-1">neta en USD · com. 3% incluida</p>
        <div className="mt-4 pt-4 border-t border-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-xs">Comprado hoy</p>
            <p className="text-white font-semibold tabular-nums">${fmt(stats.totalAmountDay)}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-200 text-xs">Operaciones</p>
            <p className="text-white font-semibold">{stats.pendingCount + (stats.totalAmountDay > 0 ? 1 : 0)}</p>
          </div>
        </div>
      </div>

      {/* Semana y mes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <p className="text-xs font-medium text-slate-500">Esta semana</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">${fmt(stats.totalProfitWeek)}</p>
          <p className="text-xs text-slate-400 mt-1">${fmt(stats.totalAmountWeek)} comprado</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <p className="text-xs font-medium text-slate-500">Este mes</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">${fmt(stats.totalProfitMonth)}</p>
          <p className="text-xs text-slate-400 mt-1">${fmt(stats.totalAmountMonth)} comprado</p>
        </div>
      </div>

      {/* Alerta pendientes */}
      {stats.pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-amber-100 rounded-xl p-2 flex-shrink-0">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {stats.pendingCount} entrega{stats.pendingCount !== 1 ? 's' : ''} pendiente{stats.pendingCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-amber-600">${fmt(stats.pendingAmount)} por recibir</p>
          </div>
        </div>
      )}
    </div>
  )
}
