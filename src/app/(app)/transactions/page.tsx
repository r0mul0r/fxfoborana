import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TransactionRowActions } from '@/components/transactions/transaction-row-actions'
import type { Transaction } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, clients(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const all: Transaction[] = transactions ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transacciones</h1>
          <p className="text-slate-500 text-sm mt-1">{all.length} operaciones registradas</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/transactions/new">
            <Plus className="h-4 w-4 mr-2" />
            Registrar compra
          </Link>
        </Button>
      </div>

      {all.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ArrowLeftRight className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Sin transacciones aún</p>
            <p className="text-slate-400 text-sm mt-1">Registra tu primera compra de divisas</p>
            <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/transactions/new">
                <Plus className="h-4 w-4 mr-2" />
                Registrar compra
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Cliente</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Monto</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">T. Compra</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">T. Mercado</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Ganancia (USD)</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {all.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {format(new Date(tx.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${tx.client_id}`}
                        className="font-medium text-slate-800 hover:text-emerald-600"
                      >
                        {(tx.clients as { name: string } | undefined)?.name ?? '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      ${fmt(tx.amount)} <span className="text-slate-400 text-xs">{tx.currency}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{fmt(tx.buy_rate)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{fmt(tx.market_rate)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      ${fmt(tx.profit ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        className={`text-xs ${
                          tx.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {tx.status === 'delivered' ? 'Entregado' : 'Pendiente'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <TransactionRowActions transaction={tx} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
