'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ArrowLeftRight, Plus, Receipt, TrendingUp, Banknote } from 'lucide-react'
import { cn } from '@/lib/utils'

const leftItems = [
  { href: '/dashboard', label: 'Inicio',    icon: LayoutDashboard },
  { href: '/clients',   label: 'Clientes',  icon: Users },
]
const rightItems = [
  { href: '/transactions', label: 'Divisas', icon: ArrowLeftRight },
  { href: '/expenses',     label: 'Gastos',  icon: Receipt },
  { href: '/p2p',          label: 'P2P',     icon: TrendingUp },
  { href: '/abonos',       label: 'Abonos',  icon: Banknote },
]

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-center md:hidden">
      {leftItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors',
            isActive(href) ? 'text-emerald-600' : 'text-slate-400'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}

      {/* FAB */}
      <Link
        href="/transactions/new"
        className="flex-none mx-3 -mt-5 bg-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-600/30 text-white"
        aria-label="Nueva compra"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {rightItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors',
            isActive(href) ? 'text-emerald-600' : 'text-slate-400'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
