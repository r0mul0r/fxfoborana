'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, ChevronDown } from 'lucide-react'
import type { ExpenseCategory } from '@/types'

const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'comida',          label: 'Comida',           emoji: '🍔' },
  { value: 'transporte',      label: 'Transporte',       emoji: '🚗' },
  { value: 'servicios',       label: 'Servicios',        emoji: '💡' },
  { value: 'entretenimiento', label: 'Entretenimiento',  emoji: '🎮' },
  { value: 'salud',           label: 'Salud',            emoji: '💊' },
  { value: 'otro',            label: 'Otro',             emoji: '📦' },
]

const inputCls  = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
const selectCls = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none"
const labelCls  = "block text-sm font-medium text-slate-600 mb-1.5"

export function NewExpenseForm() {
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory>('otro')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)
    const description = (formData.get('description') as string).trim()

    if (!amount || amount <= 0) {
      toast.error('Ingresa un monto válido')
      setLoading(false)
      return
    }
    if (!description) {
      toast.error('Ingresa una descripción')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount,
      category,
      description,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('¡Gasto registrado!')
    router.push('/expenses')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Monto */}
      <div>
        <label className={labelCls}>Monto *</label>
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          placeholder="25.00"
          className={inputCls}
          required
        />
      </div>

      {/* Categoría */}
      <div>
        <label className={labelCls}>Categoría</label>
        <div className="relative">
          <select
            name="category"
            value={category}
            onChange={e => setCategory(e.target.value as ExpenseCategory)}
            className={selectCls}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className={labelCls}>Descripción *</label>
        <input
          name="description"
          type="text"
          placeholder="Ej: Almuerzo, gasolina, Netflix..."
          className={inputCls}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-rose-500 text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Registrar gasto'}
      </button>
    </form>
  )
}
