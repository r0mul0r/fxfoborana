'use client'

import { User } from '@supabase/supabase-js'
import { logout } from '@/lib/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react'

export function Topbar({ user }: { user: User }) {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-end px-6">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer outline-none">
          <div className="bg-emerald-100 rounded-full p-1">
            <UserIcon className="h-4 w-4 text-emerald-700" />
          </div>
          <span className="text-slate-700 max-w-[160px] truncate">{user.email}</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-slate-500 truncate">{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => logout()}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
