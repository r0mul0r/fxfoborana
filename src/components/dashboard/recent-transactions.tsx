import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Transaction } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Transacciones recientes</CardTitle>
        <Link href="/transactions" className="text-xs text-emerald-600 hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Sin transacciones aún</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {(t.clients as { name: string } | undefined)?.name ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(t.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">${fmt(t.amount)} {t.currency}</p>
                  <Badge variant={t.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                    {t.status === 'delivered' ? 'Entregado' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
