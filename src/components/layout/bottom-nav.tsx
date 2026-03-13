'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ArrowLeftRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard',    label: 'Inicio',        icon: LayoutDashboard },
  { href: '/clients',      label: 'Clientes',      icon: Users },
  { href: '/transactions', label: 'Historial',     icon: ArrowLeftRight },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-center md:hidden safe-area-bottom">
      {items.slice(0, 2).map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors',
            pathname === href || pathname.startsWith(href + '/')
              ? 'text-emerald-600'
              : 'text-slate-400'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}

      {/* FAB center button */}
      <Link
        href="/transactions/new"
        className="flex-none mx-2 -mt-6 bg-emerald-600 rounded-2xl p-4 shadow-lg shadow-emerald-600/30 text-white flex flex-col items-center justify-center gap-0.5"
        aria-label="Nueva compra"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {items.slice(2).map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors',
            pathname === href || pathname.startsWith(href + '/')
              ? 'text-emerald-600'
              : 'text-slate-400'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
