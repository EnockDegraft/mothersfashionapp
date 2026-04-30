'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, Plus, Eye, Edit, Trash2, Loader } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  sku: string
  category: string
  unit_price: number
  inventory?: Array<{
    quantity_on_hand: number
    low_stock_level: number
  }>
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [addFormData, setAddFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
    quantity_on_hand: '',
    low_stock_level: '',
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      console.log('[v0] Fetching products from database...')
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          category,
          unit_price,
          inventory (
            quantity_on_hand,
            low_stock_level
          )
        `)
        .order('name', { ascending: true })

      if (fetchError) {
        console.error('[v0] Supabase error:', fetchError)
        throw new Error(fetchError.message)
      }

      console.log('[v0] Products loaded successfully:', data)
      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (err) {
      console.error('[v0] Error loading products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      const supabase = createClient()
      console.log('[v0] Deleting product:', id)
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (deleteError) throw new Error(deleteError.message)

      console.log('[v0] Product deleted successfully')
      setProducts(products.filter((p) => p.id !== id))
    } catch (err) {
      console.error('[v0] Error deleting product:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    const inventory = product.inventory?.[0]
    setEditFormData({
      name: product.name,
      sku: product.sku,
      category: product.category || '',
      unit_price: product.unit_price.toString(),
      quantity_on_hand: inventory?.quantity_on_hand.toString() || '',
      low_stock_level: inventory?.low_stock_level.toString() || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    if (!editFormData.name.trim()) {
      setError('Product name is required')
      return
    }

    if (!editFormData.sku.trim()) {
      setError('SKU is required')
      return
    }

    try {
      setIsSubmitting(true)
      const supabase = createClient()

      console.log('[v0] Updating product:', selectedProduct.id)

      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: editFormData.name.trim(),
          sku: editFormData.sku.trim(),
          category: editFormData.category.trim(),
          unit_price: parseFloat(editFormData.unit_price),
        })
        .eq('id', selectedProduct.id)

      if (productError) throw new Error(productError.message)

      // Update inventory if changed
      if (selectedProduct.inventory?.[0]) {
        const { error: inventoryError } = await supabase
          .from('inventory')
          .update({
            quantity_on_hand: parseInt(editFormData.quantity_on_hand),
            low_stock_level: parseInt(editFormData.low_stock_level),
          })
          .eq('product_id', selectedProduct.id)

        if (inventoryError) throw new Error(inventoryError.message)
      }

      console.log('[v0] Product updated successfully')
      setIsEditDialogOpen(false)
      setEditFormData({ name: '', sku: '', category: '', unit_price: '', quantity_on_hand: '', low_stock_level: '' })
      await loadProducts()
    } catch (err) {
      console.error('[v0] Error updating product:', err)
      setError(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!addFormData.name.trim()) {
      setError('Product name is required')
      return
    }

    if (!addFormData.sku.trim()) {
      setError('SKU is required')
      return
    }

    if (!addFormData.unit_price) {
      setError('Unit price is required')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const supabase = createClient()

      console.log('[v0] Creating new product:', addFormData.name)

      // Create product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([
          {
            name: addFormData.name.trim(),
            sku: addFormData.sku.trim(),
            category: addFormData.category.trim(),
            unit_price: parseFloat(addFormData.unit_price),
          },
        ])
        .select('id')
        .single()

      if (productError) throw new Error(productError.message)

      // Create inventory record
      if (productData) {
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert([
            {
              product_id: productData.id,
              quantity_on_hand: 0,
              low_stock_level: 5,
            },
          ])

        if (inventoryError) throw new Error(inventoryError.message)
      }

      console.log('[v0] Product created successfully')
      setIsAddDialogOpen(false)
      setAddFormData({ name: '', sku: '', category: '', unit_price: '' })
      await loadProducts()
    } catch (err) {
      console.error('[v0] Error creating product:', err)
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLowStockStatus = (product: Product) => {
    const inventory = product.inventory?.[0]
    if (!inventory) return null
    if (inventory.quantity_on_hand <= 0) return 'Out of Stock'
    if (inventory.quantity_on_hand <= inventory.low_stock_level) return 'Low Stock'
    return null
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">Track and manage product stock levels</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products found. Create one to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const status = getLowStockStatus(product)
                    const qty = product.inventory?.[0]?.quantity_on_hand || 0
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="hover:underline text-blue-600 cursor-pointer"
                          >
                            {product.name}
                          </button>
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category || '-'}</TableCell>
                        <TableCell>GHS {product.unit_price.toFixed(2)}</TableCell>
                        <TableCell>{qty}</TableCell>
                        <TableCell>
                          {status ? (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <AlertCircle className="w-4 h-4" />
                              {status}
                            </div>
                          ) : (
                            <span className="text-green-600">In Stock</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">SKU</Label>
                <p className="font-medium">{selectedProduct.sku}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="font-medium">{selectedProduct.category || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Unit Price</Label>
                <p className="font-medium">GHS {selectedProduct.unit_price.toFixed(2)}</p>
              </div>
              {selectedProduct.inventory?.[0] && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Quantity on Hand</Label>
                    <p className="font-medium">{selectedProduct.inventory[0].quantity_on_hand}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Low Stock Level</Label>
                    <p className="font-medium">{selectedProduct.inventory[0].low_stock_level}</p>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={editFormData.sku}
                  onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                  placeholder="Enter SKU"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  placeholder="Enter category"
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price (GHS)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={editFormData.unit_price}
                  onChange={(e) => setEditFormData({ ...editFormData, unit_price: e.target.value })}
                  placeholder="Enter unit price"
                />
              </div>
              <div>
                <Label htmlFor="quantity_on_hand">Quantity on Hand</Label>
                <Input
                  id="quantity_on_hand"
                  type="number"
                  value={editFormData.quantity_on_hand}
                  onChange={(e) => setEditFormData({ ...editFormData, quantity_on_hand: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label htmlFor="low_stock_level">Low Stock Level</Label>
                <Input
                  id="low_stock_level"
                  type="number"
                  value={editFormData.low_stock_level}
                  onChange={(e) => setEditFormData({ ...editFormData, low_stock_level: e.target.value })}
                  placeholder="Enter low stock level"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Create a new product</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <Label htmlFor="add_name">Product Name</Label>
              <Input
                id="add_name"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="add_sku">SKU</Label>
              <Input
                id="add_sku"
                value={addFormData.sku}
                onChange={(e) => setAddFormData({ ...addFormData, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
            <div>
              <Label htmlFor="add_category">Category</Label>
              <Input
                id="add_category"
                value={addFormData.category}
                onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                placeholder="Enter category"
              />
            </div>
            <div>
              <Label htmlFor="add_unit_price">Unit Price (GHS)</Label>
              <Input
                id="add_unit_price"
                type="number"
                step="0.01"
                value={addFormData.unit_price}
                onChange={(e) => setAddFormData({ ...addFormData, unit_price: e.target.value })}
                placeholder="Enter unit price"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

