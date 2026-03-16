'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createP2POrderAction(data: {
  baseAmount: number
  sellRate: number
  commissionPct: number
  operations: Array<{ bsSent: number; usdtReceived: number }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: order, error } = await supabase
    .from('p2p_orders')
    .insert({
      user_id: user.id,
      base_amount: data.baseAmount,
      sell_rate: data.sellRate,
      commission_pct: data.commissionPct,
    })
    .select()
    .single()

  if (error || !order) return { error: error?.message ?? 'Error al crear orden' }

  if (data.operations.length > 0) {
    const { error: opError } = await supabase
      .from('p2p_operations')
      .insert(
        data.operations.map((op) => ({
          order_id: order.id,
          bs_sent: op.bsSent,
          usdt_received: op.usdtReceived,
        }))
      )
    if (opError) return { error: opError.message }
  }

  revalidatePath('/p2p')
  return { success: true }
}

export async function deleteP2POrderAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('p2p_orders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/p2p')
  return { success: true }
}
