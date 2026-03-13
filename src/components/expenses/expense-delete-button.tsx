'use client'

import { deleteExpenseAction } from '@/lib/actions/expenses'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ExpenseDeleteButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    const result = await deleteExpenseAction(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Gasto eliminado')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all"
      title="Eliminar"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
