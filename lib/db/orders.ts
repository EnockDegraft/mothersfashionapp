import { createClient } from '@/lib/supabase/server'

export async function getOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`)
  return data
}

export async function getOrderById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*, products(*))')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch order: ${error.message}`)
  return data
}

export async function createOrder(order: {
  customer_id: string
  order_date: string
  order_type: 'wholesale' | 'online'
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  total_amount: number
  notes?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...order, created_by: user?.id }])
    .select()
    .single()

  if (error) throw new Error(`Failed to create order: ${error.message}`)
  return data
}

export async function updateOrderStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update order: ${error.message}`)
  return data
}

export async function addOrderItem(item: {
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('order_items')
    .insert([item])
    .select()
    .single()

  if (error) throw new Error(`Failed to add order item: ${error.message}`)
  return data
}

export async function deleteOrder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').delete().eq('id', id)

  if (error) throw new Error(`Failed to delete order: ${error.message}`)
}

export async function getOrderStats() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_order_stats')

  if (error) throw new Error(`Failed to fetch order stats: ${error.message}`)
  return data
}
