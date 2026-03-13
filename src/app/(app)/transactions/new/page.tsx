import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
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
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registrar compra</h1>
        <p className="text-slate-500 text-sm mt-1">Registra una compra de divisas a un cliente</p>
      </div>
      <NewTransactionForm clients={clients ?? []} defaultClientId={client_id} />
    </div>
  )
}
