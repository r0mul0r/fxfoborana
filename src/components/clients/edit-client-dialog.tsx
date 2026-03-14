'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateClientAction } from '@/lib/actions/clients'
import { toast } from 'sonner'
import { Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Client } from '@/types'

const inputCls = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
const labelCls = "block text-sm font-medium text-slate-600 mb-1.5"

export function EditClientDialog({ client }: { client: Client }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateClientAction(client.id, formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Cliente actualizado')
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-9 px-3 gap-1.5"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className={labelCls}>Nombre *</label>
            <input
              name="name"
              type="text"
              defaultValue={client.name}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              name="phone"
              type="tel"
              defaultValue={client.phone ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input
              name="email"
              type="email"
              defaultValue={client.email ?? ''}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Notas</label>
            <input
              name="notes"
              type="text"
              defaultValue={client.notes ?? ''}
              placeholder="Opcional..."
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar cambios'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
