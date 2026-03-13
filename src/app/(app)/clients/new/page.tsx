import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { NewClientForm } from '@/components/clients/new-client-form'

export default function NewClientPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo cliente</h1>
        <p className="text-slate-500 text-sm mt-1">Registra un nuevo cliente vendedor de divisas</p>
      </div>
      <NewClientForm />
    </div>
  )
}
