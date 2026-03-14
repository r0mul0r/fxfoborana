'use client'

import { markDeliveredAction, deleteTransactionAction } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/button'
import { AddPaymentDialog } from '@/components/clients/add-payment-dialog'
import { toast } from 'sonner'
import { CheckCheck, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Transaction } from '@/types'

interface Props {
  transaction: Transaction
  amountPaid: number
}

export function ClientTransactionActions({ transaction, amountPaid }: Props) {
  const router = useRouter()
  const pending = Math.max(0, Number(transaction.amount) - amountPaid)

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
      toast.success('Transacción eliminada')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-1 ml-2">
      {pending > 0 && (
        <AddPaymentDialog
          transactionId={transaction.id}
          clientId={transaction.client_id}
          maxAmount={pending}
          currency={transaction.currency}
        />
      )}
      {transaction.status === 'pending' && (
        <Button
          size="sm"
          variant="ghost"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
          onClick={handleDeliver}
          title="Marcar como entregado"
        >
          <CheckCheck className="h-4 w-4" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 px-2"
        onClick={handleDelete}
        title="Eliminar transacción"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
