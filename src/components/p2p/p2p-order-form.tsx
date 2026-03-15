'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { saveOrder, calcOrder } from './p2p-store'
import type { P2POperation } from './p2p-store'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtUsdt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n)
}

function parseNum(s: string) {
  return parseFloat(s.replace(',', '.')) || 0
}

function newOp(): P2POperation {
  return { id: crypto.randomUUID(), usdt: 0, rate: 0, commission: 0 }
}

export function P2POrderForm() {
  const router = useRouter()
  const [baseAmount, setBaseAmount] = useState('')
  const [sellRate, setSellRate] = useState('')
  const [commissionPct, setCommissionPct] = useState('0.3')
  const [operations, setOperations] = useState<P2POperation[]>([newOp()])

  const base = parseNum(baseAmount)
  const sell = parseNum(sellRate)
  const commPct = parseNum(commissionPct)

  const calc = calcOrder({
    baseAmount: base,
    sellRate: sell,
    commissionPct: commPct,
    operations,
  })

  const updateOp = useCallback((id: string, field: keyof P2POperation, val: string) => {
    setOperations((prev) =>
      prev.map((op) =>
        op.id === id ? { ...op, [field]: field === 'id' ? val : parseNum(val) } : op
      )
    )
  }, [])

  const removeOp = useCallback((id: string) => {
    setOperations((prev) => prev.filter((op) => op.id !== id))
  }, [])

  function handleSave() {
    if (base <= 0 || sell <= 0) return
    saveOrder({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      baseAmount: base,
      sellRate: sell,
      commissionPct: commPct,
      operations,
    })
    router.push('/p2p')
  }

  const profitPositive = calc.profit >= 0

  return (
    <div className="space-y-5">
      {/* Inputs principales */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
        <h2 className="text-sm font-semibold text-slate-600">Datos de la orden</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium">Bs recibidos</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="1500000"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium">Tasa de venta (Bs/USDT)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="633"
              value={sellRate}
              onChange={(e) => setSellRate(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div className="w-36">
          <label className="text-xs text-slate-500 font-medium">Comisión base (%)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.3"
            value={commissionPct}
            onChange={(e) => setCommissionPct(e.target.value)}
            className="mt-1 w-full h-11 px-3 rounded-xl border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Resumen rápido */}
        {base > 0 && sell > 0 && (
          <div className="bg-amber-50 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-amber-600 font-medium">Comisión</p>
              <p className="text-sm font-bold text-slate-800">Bs {fmt(calc.commissionFee)}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600 font-medium">Bs neto</p>
              <p className="text-sm font-bold text-slate-800">Bs {fmt(calc.netBs)}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600 font-medium">USDT entregados</p>
              <p className="text-sm font-bold text-slate-800">{fmtUsdt(calc.usdtSold)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de compras en Binance */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-600">Compras en Binance</h2>
          <button
            onClick={() => setOperations((prev) => [...prev, newOp()])}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold active:scale-95 transition-transform"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-slate-50 text-xs text-slate-400 font-medium">
          <span>USDT</span>
          <span>Tasa (Bs)</span>
          <span>Comisión (Bs)</span>
          <span className="w-8" />
        </div>

        {operations.map((op) => {
          const rowTotal = op.usdt * op.rate + op.commission
          return (
            <div key={op.id} className="border-b last:border-0">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-4 py-2 items-center">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  defaultValue={op.usdt || ''}
                  onChange={(e) => updateOp(op.id, 'usdt', e.target.value)}
                  className="h-9 px-2 rounded-lg border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 w-full"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  defaultValue={op.rate || ''}
                  onChange={(e) => updateOp(op.id, 'rate', e.target.value)}
                  className="h-9 px-2 rounded-lg border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 w-full"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  defaultValue={op.commission || ''}
                  onChange={(e) => updateOp(op.id, 'commission', e.target.value)}
                  className="h-9 px-2 rounded-lg border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 w-full"
                />
                <button
                  onClick={() => removeOp(op.id)}
                  disabled={operations.length === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {rowTotal > 0 && (
                <p className="px-4 pb-2 text-xs text-slate-400">
                  Total fila: <span className="font-semibold text-slate-600">Bs {fmt(rowTotal)}</span>
                </p>
              )}
            </div>
          )
        })}

        {/* Totales tabla */}
        <div className="grid grid-cols-2 gap-3 px-4 py-3 bg-slate-50 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Total USDT comprados</p>
            <p className="text-sm font-bold text-slate-800">{fmtUsdt(calc.totalUsdtBought)} USDT</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Bs gastados</p>
            <p className="text-sm font-bold text-slate-800">Bs {fmt(calc.totalBsSpent)}</p>
          </div>
        </div>
      </div>

      {/* Resultado final */}
      {base > 0 && sell > 0 && (
        <div className={`rounded-2xl p-5 ${profitPositive ? 'bg-emerald-600' : 'bg-rose-500'} text-white`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5" />
            <p className="text-sm font-semibold opacity-80">Ganancia estimada</p>
          </div>
          <p className="text-4xl font-bold tabular-nums">
            {profitPositive ? '+' : ''}Bs {fmt(calc.profit)}
          </p>
          {sell > 0 && calc.profit !== 0 && (
            <p className="text-sm opacity-75 mt-1">
              ≈ {fmtUsdt(Math.abs(calc.profit) / sell)} USDT
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="opacity-70 text-xs">Bs recibidos</p>
              <p className="font-bold">Bs {fmt(base)}</p>
            </div>
            <div>
              <p className="opacity-70 text-xs">Comisión {commPct}%</p>
              <p className="font-bold">-Bs {fmt(calc.commissionFee)}</p>
            </div>
            <div>
              <p className="opacity-70 text-xs">Bs gastados (Binance)</p>
              <p className="font-bold">-Bs {fmt(calc.totalBsSpent)}</p>
            </div>
            <div>
              <p className="opacity-70 text-xs">USDT comprados vs entregados</p>
              <p className="font-bold">{fmtUsdt(calc.totalUsdtBought)} / {fmtUsdt(calc.usdtSold)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Guardar */}
      <button
        onClick={handleSave}
        disabled={base <= 0 || sell <= 0}
        className="w-full h-12 rounded-2xl bg-amber-500 text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none shadow-sm shadow-amber-500/30"
      >
        Guardar orden
      </button>
    </div>
  )
}
