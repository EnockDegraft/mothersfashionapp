import { createClient } from '@/lib/supabase/server'

export async function getUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return data || null
}

export async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch users: ${error.message}`)
  return data
}

export async function updateUserProfile(updates: {
  first_name?: string
  last_name?: string
  phone?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update profile: ${error.message}`)
  return data
}
