import { createClient } from '@/lib/supabase/server'

export async function getInventory() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch inventory: ${error.message}`)
  return data
}

export async function getInventoryByProduct(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', productId)
    .single()

  if (error) throw new Error(`Failed to fetch inventory: ${error.message}`)
  return data
}

export async function getLowStockProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_low_stock_products')

  if (error) throw new Error(`Failed to fetch low stock products: ${error.message}`)
  return data
}

export async function updateInventoryStock(
  productId: string,
  quantityChange: number,
  reason: string,
  notes?: string
) {
  const supabase = await createClient()

  // Get current inventory
  const { data: inventory, error: fetchError } = await supabase
    .from('inventory')
    .select('quantity_on_hand')
    .eq('product_id', productId)
    .single()

  if (fetchError) throw new Error(`Failed to fetch inventory: ${fetchError.message}`)

  const newQuantity = (inventory?.quantity_on_hand || 0) + quantityChange

  // Update inventory
  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity_on_hand: newQuantity })
    .eq('product_id', productId)

  if (updateError) throw new Error(`Failed to update inventory: ${updateError.message}`)

  // Log transaction
  const { error: logError } = await supabase.from('inventory_transactions').insert([
    {
      product_id: productId,
      transaction_type: reason,
      quantity_changed: quantityChange,
      notes,
    },
  ])

  if (logError) throw new Error(`Failed to log transaction: ${logError.message}`)

  return { success: true, newQuantity }
}
