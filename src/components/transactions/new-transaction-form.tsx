'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, TrendingUp, ChevronDown } from 'lucide-react'

interface Props {
  clients: { id: string; name: string }[]
  defaultClientId?: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

const selectCls = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none"
const inputCls  = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
const labelCls  = "block text-sm font-medium text-slate-600 mb-1.5"

export function NewTransactionForm({ clients, defaultClientId }: Props) {
  const [loading, setLoading] = useState(false)
  const [clientId, setClientId] = useState(defaultClientId ?? '')
  const [currency, setCurrency] = useState('USD')
  const [amount, setAmount] = useState('')
  const [buyRate, setBuyRate] = useState('')
  const [marketRate, setMarketRate] = useState('')
  const [notes, setNotes] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const a = parseFloat(amount)
  const b = parseFloat(buyRate)
  const m = parseFloat(marketRate)
  const hasValues = a > 0 && b > 0 && m > 0

  const totalPaid       = hasValues ? a * b : null
  const totalMarket     = hasValues ? a * m : null
  const profitGrossUsd  = hasValues ? ((m - b) * a) / m : null
  const commission      = profitGrossUsd !== null ? profitGrossUsd * 0.03 : null
  const profitNetUsd    = profitGrossUsd !== null ? profitGrossUsd * 0.97 : null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!clientId) { toast.error('Selecciona un cliente'); return }
    if (!hasValues) { toast.error('Completa todos los campos numéricos'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      client_id: clientId,
      currency,
      amount: a,
      buy_rate: b,
      market_rate: m,
      notes: notes.trim() || null,
      status: 'pending',
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('¡Compra registrada!')
    router.push('/transactions')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cliente */}
      <div>
        <label className={labelCls}>Cliente *</label>
        <div className="relative">
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className={selectCls}
            required
          >
            <option value="">Selecciona un cliente...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Moneda + Monto */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Moneda</label>
          <div className="relative">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className={selectCls}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="COP">COP</option>
              <option value="BRL">BRL</option>
              <option value="PEN">PEN</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Monto *</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="100.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={inputCls}
            required
          />
        </div>
      </div>

      {/* Tasas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Tasa compra *</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="550.00"
            value={buyRate}
            onChange={e => setBuyRate(e.target.value)}
            className={inputCls}
            required
          />
          <p className="text-xs text-slate-400 mt-1">Lo que pagas</p>
        </div>
        <div>
          <label className={labelCls}>Tasa mercado *</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="600.00"
            value={marketRate}
            onChange={e => setMarketRate(e.target.value)}
            className={inputCls}
            required
          />
          <p className="text-xs text-slate-400 mt-1">Tasa de referencia</p>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className={labelCls}>Notas</label>
        <input
          type="text"
          placeholder="Opcional..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Preview */}
      {profitNetUsd !== null && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Resumen de la operación
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Pagas</p>
              <p className="font-semibold text-slate-800">{fmt(totalPaid!)}</p>
            </div>
            <div className="bg-white rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Valor mercado</p>
              <p className="font-semibold text-slate-800">{fmt(totalMarket!)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-white rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Bruta</p>
              <p className="font-semibold text-slate-700">${fmt(profitGrossUsd!)}</p>
            </div>
            <div className="bg-white rounded-xl px-3 py-2">
              <p className="text-slate-400 text-xs">Com. 3%</p>
              <p className="font-semibold text-red-400">-${fmt(commission!)}</p>
            </div>
            <div className="bg-emerald-600 rounded-xl px-3 py-2">
              <p className="text-emerald-200 text-xs">Neta</p>
              <p className="font-bold text-white">${fmt(profitNetUsd!)}</p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Registrar compra'}
      </button>
    </form>
  )
}
