'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, TrendingUp, Plus, TrendingDown } from 'lucide-react'
import { getOrders, deleteOrder, calcOrder } from './p2p-store'
import type { P2POrder } from './p2p-store'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export function P2POrdersList() {
  const [orders, setOrders] = useState<P2POrder[]>([])

  useEffect(() => {
    setOrders(getOrders())
  }, [])

  function handleDelete(id: string) {
    deleteOrder(id)
    setOrders(getOrders())
  }

  const totalProfit = orders.reduce((s, o) => s + calcOrder(o).profit, 0)

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm py-16 text-center">
        <div className="bg-amber-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-amber-400" />
        </div>
        <p className="text-slate-600 font-semibold">Sin órdenes aún</p>
        <p className="text-slate-400 text-sm mt-1">Registra tu primera operación P2P</p>
        <Link
          href="/p2p/new"
          className="inline-flex items-center gap-2 mt-5 h-11 px-6 bg-amber-500 text-white rounded-xl text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Nueva orden
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats resumen */}
      <div className="bg-amber-500 rounded-2xl p-5 text-white">
        <p className="text-amber-100 text-sm font-medium">Ganancia acumulada</p>
        <p className="text-4xl font-bold mt-1 tabular-nums">
          {totalProfit >= 0 ? '' : '-'}Bs {fmt(Math.abs(totalProfit))}
        </p>
        <div className="mt-4 pt-4 border-t border-amber-400 grid grid-cols-2 gap-4">
          <div>
            <p className="text-amber-100 text-xs">Total órdenes</p>
            <p className="text-white font-bold text-lg">{orders.length}</p>
          </div>
          <div>
            <p className="text-amber-100 text-xs">Promedio por orden</p>
            <p className="text-white font-bold text-lg tabular-nums">
              Bs {fmt(orders.length > 0 ? totalProfit / orders.length : 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 mb-3">Historial</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {orders.map((order) => {
            const c = calcOrder(order)
            const positive = c.profit >= 0
            return (
              <div key={order.id} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${positive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  {positive
                    ? <TrendingUp className="h-5 w-5 text-emerald-600" />
                    : <TrendingDown className="h-5 w-5 text-rose-500" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    Bs {fmt(order.baseAmount)} · Tasa {order.sellRate}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(order.createdAt), "dd MMM · HH:mm", { locale: es })}
                    {' · '}{order.operations.length} op{order.operations.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <p className={`text-base font-bold ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {positive ? '+' : ''}Bs {fmt(c.profit)}
                  </p>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
