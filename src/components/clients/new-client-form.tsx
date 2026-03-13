'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const inputCls = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
const labelCls = "block text-sm font-medium text-slate-600 mb-1.5"

export function NewClientForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('clients').insert({
      user_id: user.id,
      name: formData.get('name') as string,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Cliente registrado')
    router.push('/clients')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelCls}>Nombre *</label>
        <input name="name" type="text" placeholder="Luis García" required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Teléfono</label>
        <input name="phone" type="tel" placeholder="+58 412 000 0000" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Correo electrónico</label>
        <input name="email" type="email" placeholder="luis@email.com" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Notas</label>
        <input name="notes" type="text" placeholder="Opcional..." className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar cliente'}
      </button>
    </form>
  )
}
