'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTransactionAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const clientId = formData.get('client_id') as string
  const currency = formData.get('currency') as string
  const amount = parseFloat(formData.get('amount') as string)
  const buyRate = parseFloat(formData.get('buy_rate') as string)
  const marketRate = parseFloat(formData.get('market_rate') as string)
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    client_id: clientId,
    currency,
    amount,
    buy_rate: buyRate,
    market_rate: marketRate,
    notes: notes || null,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  redirect('/transactions')
}

export async function markDeliveredAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('transactions')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/clients')
  return { success: true }
}

export async function deleteTransactionAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  return { success: true }
}
