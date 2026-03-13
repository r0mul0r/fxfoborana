import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { NewTransactionForm } from '@/components/transactions/new-transaction-form'

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>
}) {
  const { client_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('user_id', user!.id)
    .order('name')

  return (
    <div className="space-y-5">
      <div>
        <Link href="/transactions" className="inline-flex items-center gap-1 text-sm text-slate-500 active:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Historial
        </Link>
        <h1 className="text-xl font-bold text-slate-900 mt-3">Registrar compra</h1>
        <p className="text-sm text-slate-400">Nueva compra de divisas</p>
      </div>

      {clients && clients.length === 0 ? (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
          <p className="text-amber-800 font-semibold text-sm">No tienes clientes registrados</p>
          <p className="text-amber-600 text-xs mt-1">Agrega un cliente antes de registrar una compra</p>
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center mt-4 h-10 px-5 bg-amber-600 text-white rounded-xl text-sm font-semibold"
          >
            Agregar cliente
          </Link>
        </div>
      ) : (
        <NewTransactionForm clients={clients ?? []} defaultClientId={client_id} />
      )}
    </div>
  )
}
