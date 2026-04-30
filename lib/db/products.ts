import { createClient } from '@/lib/supabase/server'

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch products: ${error.message}`)
  return data
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch product: ${error.message}`)
  return data
}

export async function createProduct(product: {
  name: string
  sku: string
  description?: string
  category: string
  unit_price: number
  reorder_level: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) throw new Error(`Failed to create product: ${error.message}`)
  return data
}

export async function updateProduct(
  id: string,
  product: Partial<{
    name: string
    sku: string
    description: string
    category: string
    unit_price: number
    reorder_level: number
  }>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update product: ${error.message}`)
  return data
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) throw new Error(`Failed to delete product: ${error.message}`)
}
