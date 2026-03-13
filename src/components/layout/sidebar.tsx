'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  DollarSign,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">FX Control</h1>
            <p className="text-slate-400 text-xs mt-0.5">Divisas</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs text-center">FX Control v1.0</p>
      </div>
    </aside>
  )
}
