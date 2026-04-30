import { createClient } from '@/lib/supabase/server'

export async function getCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch customers: ${error.message}`)
  return data
}

export async function getCustomerById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch customer: ${error.message}`)
  return data
}

export async function createCustomer(customer: {
  name: string
  contact_email: string
  contact_phone?: string
  business_name?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('customers')
    .insert([{ ...customer, created_by: user?.id }])
    .select()
    .single()

  if (error) throw new Error(`Failed to create customer: ${error.message}`)
  return data
}

export async function updateCustomer(
  id: string,
  customer: Partial<{
    name: string
    contact_email: string
    contact_phone: string
    business_name: string
    address: string
    city: string
    state: string
    postal_code: string
    country: string
  }>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update customer: ${error.message}`)
  return data
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)

  if (error) throw new Error(`Failed to delete customer: ${error.message}`)
}
