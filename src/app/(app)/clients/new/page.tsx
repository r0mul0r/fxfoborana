import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewClientForm } from '@/components/clients/new-client-form'

export default function NewClientPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-slate-500 active:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Clientes
        </Link>
        <h1 className="text-xl font-bold text-slate-900 mt-3">Nuevo cliente</h1>
        <p className="text-sm text-slate-400">Registra un cliente que te vende divisas</p>
      </div>
      <NewClientForm />
    </div>
  )
}
