import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Calendar, Clock } from 'lucide-react'
import type { DashboardStats } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtUsd(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-4">
      {/* Period tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Day */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold text-slate-900">${fmtUsd(stats.totalAmountDay)}</p>
            <p className="text-sm text-slate-500">comprado</p>
            <p className="text-emerald-600 font-semibold text-lg">${fmt(stats.totalProfitDay)}</p>
            <p className="text-xs text-slate-400">ganancia neta (USD, c/3% com.)</p>
          </CardContent>
        </Card>

        {/* Week */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Esta semana
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold text-slate-900">${fmtUsd(stats.totalAmountWeek)}</p>
            <p className="text-sm text-slate-500">comprado</p>
            <p className="text-emerald-600 font-semibold text-lg">${fmt(stats.totalProfitWeek)}</p>
            <p className="text-xs text-slate-400">ganancia neta (USD, c/3% com.)</p>
          </CardContent>
        </Card>

        {/* Month */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Este mes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold text-slate-900">${fmtUsd(stats.totalAmountMonth)}</p>
            <p className="text-sm text-slate-500">comprado</p>
            <p className="text-emerald-600 font-semibold text-lg">${fmt(stats.totalProfitMonth)}</p>
            <p className="text-xs text-slate-400">ganancia neta (USD, c/3% com.)</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">
              {stats.pendingCount} entrega{stats.pendingCount !== 1 ? 's' : ''} pendiente{stats.pendingCount !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-amber-600">
              ${fmtUsd(stats.pendingAmount)} por recibir de clientes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
