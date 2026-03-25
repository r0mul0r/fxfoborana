'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, ArrowLeftRight, DollarSign, Plus, Receipt, TrendingUp, Banknote } from 'lucide-react'

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/clients',      label: 'Clientes',      icon: Users },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/expenses',     label: 'Gastos',        icon: Receipt },
  { href: '/p2p',          label: 'P2P Binance',   icon: TrendingUp },
  { href: '/abonos',       label: 'Abonos',        icon: Banknote },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 bg-slate-950 text-white flex-col flex-shrink-0">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-none">FX Control</h1>
            <p className="text-slate-500 text-xs mt-0.5">Divisas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <Link
          href="/transactions/new"
          className="flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva compra
        </Link>
      </div>
    </aside>
  )
}
