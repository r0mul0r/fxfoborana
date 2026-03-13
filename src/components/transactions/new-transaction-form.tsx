'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, TrendingUp } from 'lucide-react'

interface Props {
  clients: { id: string; name: string }[]
  defaultClientId?: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export function NewTransactionForm({ clients, defaultClientId }: Props) {
  const [loading, setLoading] = useState(false)
  const [clientId, setClientId] = useState(defaultClientId ?? '')
  const [currency, setCurrency] = useState('USD')
  const [amount, setAmount] = useState('')
  const [buyRate, setBuyRate] = useState('')
  const [marketRate, setMarketRate] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Cálculos en tiempo real
  const hasValues = amount && buyRate && marketRate &&
    parseFloat(amount) > 0 && parseFloat(buyRate) > 0 && parseFloat(marketRate) > 0

  const totalPaid = hasValues
    ? parseFloat(amount) * parseFloat(buyRate)
    : null

  const totalMarket = hasValues
    ? parseFloat(amount) * parseFloat(marketRate)
    : null

  // Ganancia bruta en USD = diferencia de tasas × monto / tasa mercado
  const profitGrossUsd = hasValues
    ? ((parseFloat(marketRate) - parseFloat(buyRate)) * parseFloat(amount)) / parseFloat(marketRate)
    : null

  const commission = profitGrossUsd !== null ? profitGrossUsd * 0.03 : null
  const profitNetUsd = profitGrossUsd !== null ? profitGrossUsd * 0.97 : null

  function handleClientChange(value: string | null) {
    setClientId(value ?? '')
  }

  function handleCurrencyChange(value: string | null) {
    setCurrency(value ?? 'USD')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!clientId) {
      toast.error('Selecciona un cliente')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      client_id: clientId,
      currency,
      amount: parseFloat(amount),
      buy_rate: parseFloat(buyRate),
      market_rate: parseFloat(marketRate),
      notes: (e.currentTarget.elements.namedItem('notes') as HTMLInputElement)?.value || null,
      status: 'pending',
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Compra registrada correctamente')
    router.push('/transactions')
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select value={clientId} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency + Amount */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="COP">COP</SelectItem>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="PEN">PEN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="50.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="buy_rate">Tasa de compra *</Label>
              <Input
                id="buy_rate"
                name="buy_rate"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="550.00"
                value={buyRate}
                onChange={e => setBuyRate(e.target.value)}
                required
              />
              <p className="text-xs text-slate-400">Lo que pagas por unidad</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market_rate">Tasa de mercado *</Label>
              <Input
                id="market_rate"
                name="market_rate"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="600.00"
                value={marketRate}
                onChange={e => setMarketRate(e.target.value)}
                required
              />
              <p className="text-xs text-slate-400">Tasa de venta / referencia</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Input id="notes" name="notes" placeholder="Opcional..." />
          </div>

          {/* Preview */}
          {profitNetUsd !== null && (
            <>
              <Separator />
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Resumen de la operación
                </p>

                {/* Fila 1: movimiento en moneda local */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-md px-3 py-2">
                    <p className="text-slate-400 text-xs mb-0.5">Pagas (moneda local)</p>
                    <p className="font-semibold text-slate-800">{fmt(totalPaid!)}</p>
                  </div>
                  <div className="bg-white rounded-md px-3 py-2">
                    <p className="text-slate-400 text-xs mb-0.5">Valor a tasa mercado</p>
                    <p className="font-semibold text-slate-800">{fmt(totalMarket!)}</p>
                  </div>
                </div>

                {/* Fila 2: ganancia en USD */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded-md px-3 py-2">
                    <p className="text-slate-400 text-xs mb-0.5">Ganancia bruta</p>
                    <p className="font-semibold text-slate-700">${fmt(profitGrossUsd!)}</p>
                  </div>
                  <div className="bg-white rounded-md px-3 py-2">
                    <p className="text-slate-400 text-xs mb-0.5">Comisión (3%)</p>
                    <p className="font-semibold text-red-400">-${fmt(commission!)}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                    <p className="text-emerald-600 text-xs mb-0.5 font-medium">Ganancia neta</p>
                    <p className="font-bold text-emerald-700 text-base">${fmt(profitNetUsd!)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Registrar compra
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
