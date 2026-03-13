'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('clients').insert({
    user_id: user.id,
    name,
    phone: phone || null,
    email: email || null,
    notes: notes || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clients')
  redirect('/clients')
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/clients')
  redirect('/clients')
}
