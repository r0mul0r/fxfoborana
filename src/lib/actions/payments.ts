'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPaymentAction(transactionId: string, clientId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const amount = parseFloat(formData.get('amount') as string)
  const notes = formData.get('notes') as string

  if (!amount || amount <= 0) return { error: 'El monto debe ser mayor a 0' }

  const { error } = await supabase.from('payments').insert({
    user_id: user.id,
    transaction_id: transactionId,
    amount,
    notes: notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}

export async function deletePaymentAction(paymentId: string, clientId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}
