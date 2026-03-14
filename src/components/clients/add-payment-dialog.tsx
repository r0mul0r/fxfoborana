'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPaymentAction } from '@/lib/actions/payments'
import { toast } from 'sonner'
import { Banknote, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const inputCls = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
const labelCls = "block text-sm font-medium text-slate-600 mb-1.5"

interface Props {
  transactionId: string
  clientId: string
  maxAmount: number
  currency: string
}

export function AddPaymentDialog({ transactionId, clientId, maxAmount, currency }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)
    if (amount > maxAmount) {
      toast.error(`El abono no puede superar el saldo pendiente ($${maxAmount.toFixed(2)})`)
      setLoading(false)
      return
    }
    const result = await createPaymentAction(transactionId, clientId, formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Abono registrado')
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2 rounded-lg transition-colors"
        title="Registrar abono"
      >
        <Banknote className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Registrar abono</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 -mt-1">
          Saldo pendiente: <span className="font-semibold text-amber-600">${maxAmount.toFixed(2)} {currency}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div>
            <label className={labelCls}>Monto abonado *</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              placeholder="0.00"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Nota</label>
            <input
              name="notes"
              type="text"
              placeholder="Opcional..."
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Registrar abono'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
