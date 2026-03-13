import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Phone, ChevronRight } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('name')

  // Get transaction counts per client
  const { data: txCounts } = await supabase
    .from('transactions')
    .select('client_id, status')
    .eq('user_id', user!.id)

  const countMap: Record<string, { total: number; pending: number }> = {}
  for (const tx of txCounts ?? []) {
    if (!countMap[tx.client_id]) countMap[tx.client_id] = { total: 0, pending: 0 }
    countMap[tx.client_id].total++
    if (tx.status === 'pending') countMap[tx.client_id].pending++
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">{clients?.length ?? 0} clientes registrados</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo cliente
          </Link>
        </Button>
      </div>

      {!clients || clients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Sin clientes aún</p>
            <p className="text-slate-400 text-sm mt-1">Agrega tu primer cliente para comenzar</p>
            <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/clients/new">
                <Plus className="h-4 w-4 mr-2" />
                Agregar cliente
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const counts = countMap[client.id] ?? { total: 0, pending: 0 }
            return (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 rounded-full p-2.5">
                          <User className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{client.name}</p>
                          {client.phone && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {counts.total} operaciones
                      </Badge>
                      {counts.pending > 0 && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                          {counts.pending} pendiente{counts.pending !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
