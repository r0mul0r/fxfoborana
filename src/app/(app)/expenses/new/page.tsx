import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewExpenseForm } from '@/components/expenses/new-expense-form'

export default function NewExpensePage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/expenses" className="inline-flex items-center gap-1 text-sm text-slate-500 active:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Gastos
        </Link>
        <h1 className="text-xl font-bold text-slate-900 mt-3">Nuevo gasto</h1>
        <p className="text-sm text-slate-400">Registra un gasto personal</p>
      </div>
      <NewExpenseForm />
    </div>
  )
}
