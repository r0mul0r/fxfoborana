'use client'

import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { deleteP2POrderAction } from '@/lib/actions/p2p'

export function P2PDeleteButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    const result = await deleteP2POrderAction(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Orden eliminada')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
