'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useTransition } from 'react'

export function ClientsSearch({ q }: { q: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  function handleChange(value: string) {
    const params = new URLSearchParams()
    if (value) params.set('q', value)
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        type="search"
        defaultValue={q}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar cliente..."
        className="w-full h-11 pl-9 pr-9 rounded-2xl bg-white shadow-sm border-0 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {q && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
