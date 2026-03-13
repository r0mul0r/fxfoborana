'use client'

import { markDeliveredAction, deleteTransactionAction } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCheck, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Transaction } from '@/types'

export function TransactionRowActions({ transaction }: { transaction: Transaction }) {
  const router = useRouter()

  async function handleDeliver() {
    const result = await markDeliveredAction(transaction.id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Marcado como entregado')
      router.refresh()
    }
  }

  async function handleDelete() {
    const result = await deleteTransactionAction(transaction.id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Eliminado')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      {transaction.status === 'pending' && (
        <Button
          size="sm"
          variant="ghost"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 px-2"
          onClick={handleDeliver}
          title="Marcar entregado"
        >
          <CheckCheck className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 px-2"
        onClick={handleDelete}
        title="Eliminar"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
