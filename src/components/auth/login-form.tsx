'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const inputCls = "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-colors"
const labelCls = "block text-sm font-medium text-slate-600 mb-1.5"

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (error) {
      toast.error('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Correo electrónico</label>
        <input name="email" type="email" placeholder="tu@email.com" required autoComplete="email" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Contraseña</label>
        <input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60 mt-2"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
      </button>
    </form>
  )
}
