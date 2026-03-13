'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { logout } from '@/lib/actions/auth'
import { DollarSign, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Topbar({ user }: { user: User }) {
  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'FX'

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* Logo — visible en mobile, oculto en desktop (donde está el sidebar) */}
      <Link href="/dashboard" className="flex items-center gap-2 md:invisible">
        <div className="bg-emerald-600 rounded-xl p-1.5">
          <DollarSign className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-slate-900">FX Control</span>
      </Link>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors outline-none cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-700">{initials}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-2">
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout()}
            className="text-red-600 cursor-pointer gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
