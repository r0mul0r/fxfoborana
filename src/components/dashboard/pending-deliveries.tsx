'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { markDeliveredAction } from '@/lib/actions/transactions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle } from 'lucide-react'
import type { Transaction } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export function PendingDeliveries({ transactions }: { transactions: Transaction[] }) {
  async function handleDeliver(id: string) {
    const result = await markDeliveredAction(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Marcado como entregado')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Entregas pendientes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Todo entregado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {(t.clients as { name: string } | undefined)?.name ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    ${fmt(t.amount)} {t.currency} ·{' '}
                    {format(new Date(t.created_at), 'dd MMM', { locale: es })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => handleDeliver(t.id)}
                >
                  Marcar entregado
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
