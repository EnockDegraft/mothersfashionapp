'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export default function InventoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<any>(null)
  const [inventory, setInventory] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    quantity: '',
    reason: 'adjustment' as string,
    notes: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [productId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productResult, inventoryResult, transactionsResult] = await Promise.all([
        supabase.from('products').select('*').eq('id', productId).single(),
        supabase
          .from('inventory')
          .select('*')
          .eq('product_id', productId)
          .single(),
        supabase
          .from('inventory_transactions')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (productResult.error) throw productResult.error
      if (inventoryResult.error) throw inventoryResult.error
      if (transactionsResult.error) throw transactionsResult.error

      setProduct(productResult.data)
      setInventory(inventoryResult.data)
      setTransactions(transactionsResult.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const quantityChange = formData.reason.includes('add')
        ? parseInt(formData.quantity)
        : -parseInt(formData.quantity)

      const newQuantity = (inventory?.quantity_on_hand || 0) + quantityChange

      // Update inventory
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity_on_hand: newQuantity })
        .eq('product_id', productId)

      if (updateError) throw updateError

      // Log transaction
      const { error: logError } = await supabase
        .from('inventory_transactions')
        .insert([
          {
            product_id: productId,
            transaction_type: formData.reason,
            quantity_changed: quantityChange,
            notes: formData.notes,
          },
        ])

      if (logError) throw logError

      setFormData({ quantity: '', reason: 'adjustment', notes: '' })
      setOpenDialog(false)
      loadData()
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={() => router.back()} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12 text-muted-foreground">
            Product not found
          </div>
        </div>
      </main>
    )
  }

  const isLowStock =
    inventory && inventory.quantity_on_hand <= product.reorder_level

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link href="/inventory">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">Product Details & Stock Tracking</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground text-sm">SKU</Label>
                  <p className="text-lg font-semibold">{product.sku}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Category</Label>
                  <p className="text-lg font-semibold">{product.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Unit Price</Label>
                  <p className="text-lg font-semibold">GHS {product.unit_price.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Reorder Level
                  </Label>
                  <p className="text-lg font-semibold">{product.reorder_level.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Stock Adjustments</CardTitle>
                  <CardDescription>History of inventory changes</CardDescription>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Adjustment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Stock Adjustment</DialogTitle>
                      <DialogDescription>
                        Record a stock adjustment for {product.name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddTransaction} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({ ...formData, quantity: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="reason">Reason *</Label>
                        <Select
                          value={formData.reason}
                          onValueChange={(value) =>
                            setFormData({ ...formData, reason: value })
                          }
                        >
                          <SelectTrigger id="reason">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add_receipt">Add (Receipt)</SelectItem>
                            <SelectItem value="remove_sale">Remove (Sale)</SelectItem>
                            <SelectItem value="adjustment">Adjustment</SelectItem>
                            <SelectItem value="damage">Damage/Loss</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Record Adjustment
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions recorded yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {format(
                                new Date(transaction.created_at),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </TableCell>
                            <TableCell className="capitalize">
                              {transaction.transaction_type}
                            </TableCell>
                            <TableCell
                              className={
                                transaction.quantity_changed > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {transaction.quantity_changed > 0 ? '+' : ''}
                              {transaction.quantity_changed}
                            </TableCell>
                            <TableCell>{transaction.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stock Status Card */}
          <div>
            <Card className={isLowStock ? 'border-yellow-200 bg-yellow-50/50' : ''}>
              <CardHeader>
                <CardTitle>Stock Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Label className="text-muted-foreground text-sm">
                    Quantity on Hand
                  </Label>
                  <p className="text-4xl font-bold mt-2">
                    {inventory?.quantity_on_hand || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Units in stock
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Reserved</span>
                      <span className="font-semibold">
                        {inventory?.quantity_reserved || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${
                            Math.min(
                              (inventory?.quantity_reserved || 0) /
                                (inventory?.quantity_on_hand || 1),
                              1
                            ) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Reorder Level</span>
                      <span className="font-semibold">{product.reorder_level}</span>
                    </div>
                  </div>

                  {isLowStock && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-4">
                      <p className="text-sm font-semibold text-yellow-800">
                        Low Stock Alert
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Current stock is at or below reorder level. Consider placing
                        an order.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
