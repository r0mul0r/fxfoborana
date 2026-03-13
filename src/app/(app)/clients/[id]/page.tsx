import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, User, Phone, Mail, TrendingUp, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ClientTransactionActions } from '@/components/clients/client-transaction-actions'
import type { Transaction } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!client) notFound()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('client_id', id)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const all: Transaction[] = transactions ?? []
  const pending = all.filter(t => t.status === 'pending')
  const totalAmount = all.reduce((acc, t) => acc + Number(t.amount), 0)
  const totalProfit = all.reduce((acc, t) => acc + Number(t.profit ?? 0), 0)
  const pendingAmount = pending.reduce((acc, t) => acc + Number(t.amount), 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Clientes
          </Link>
        </Button>
      </div>

      {/* Client info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 rounded-full p-3">
                <User className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {client.phone && (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                  )}
                  {client.email && (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </span>
                  )}
                </div>
                {client.notes && (
                  <p className="text-sm text-slate-400 mt-1">{client.notes}</p>
                )}
              </div>
            </div>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href={`/transactions/new?client_id=${client.id}`}>
                <Plus className="h-4 w-4 mr-1" />
                Nueva transacción
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <p className="text-xs text-slate-500">Total comprado</p>
            </div>
            <p className="text-xl font-bold text-slate-800">${fmt(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-slate-500">Ganancia generada</p>
            </div>
            <p className="text-xl font-bold text-emerald-600">${fmt(totalProfit)}</p>
            <p className="text-xs text-slate-400 mt-0.5">USD neto (c/3% com.)</p>
          </CardContent>
        </Card>
        <Card className={pendingAmount > 0 ? 'bg-amber-50 border-amber-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-amber-400" />
              <p className="text-xs text-slate-500">Por entregar</p>
            </div>
            <p className={`text-xl font-bold ${pendingAmount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              ${fmt(pendingAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {all.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Sin transacciones aún</p>
          ) : (
            <div className="space-y-0">
              {all.map((tx, i) => (
                <div key={tx.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">
                          ${fmt(tx.amount)} {tx.currency}
                        </span>
                        <Badge
                          variant={tx.status === 'delivered' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            tx.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {tx.status === 'delivered' ? 'Entregado' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>Compra: {fmt(tx.buy_rate)} / Mercado: {fmt(tx.market_rate)}</span>
                        <span>·</span>
                        <span className="text-emerald-600 font-medium">
                          Ganancia: ${fmt(tx.profit ?? 0)} USD
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(tx.created_at), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
                        {tx.delivered_at && (
                          <> · Entregado: {format(new Date(tx.delivered_at), "dd MMM yyyy", { locale: es })}</>
                        )}
                      </p>
                      {tx.notes && (
                        <p className="text-xs text-slate-400 italic mt-0.5">{tx.notes}</p>
                      )}
                    </div>
                    <ClientTransactionActions transaction={tx} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
