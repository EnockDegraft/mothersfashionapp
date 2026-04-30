'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader, ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  order_date: string
  notes: string | null
  customers: {
    name: string
  } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState({
    status: '',
    total_amount: '',
    notes: '',
  })

  useEffect(() => {
    loadOrder()
  }, [])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      console.log('[v0] Fetching order:', orderId)
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          order_date,
          notes,
          customers (
            name
          )
        `)
        .eq('id', orderId)
        .single()

      if (fetchError) throw new Error(fetchError.message)
      if (!data) throw new Error('Order not found')

      // Handle customers as array or object
      const normalizedData = {
        ...data,
        customers: Array.isArray(data.customers) 
          ? data.customers[0] || null 
          : data.customers,
      }

      console.log('[v0] Order loaded:', normalizedData)
      setOrder(normalizedData)
      setEditFormData({
        status: normalizedData.status,
        total_amount: normalizedData.total_amount.toString(),
        notes: normalizedData.notes || '',
      })
    } catch (err) {
      console.error('[v0] Error loading order:', err)
      setError(err instanceof Error ? err.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      console.log('[v0] Updating order:', orderId)

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: editFormData.status,
          total_amount: parseFloat(editFormData.total_amount) || 0,
          notes: editFormData.notes || null,
        })
        .eq('id', orderId)

      if (updateError) throw new Error(updateError.message)

      console.log('[v0] Order updated successfully')
      setOrder({
        ...order,
        status: editFormData.status,
        total_amount: parseFloat(editFormData.total_amount),
        notes: editFormData.notes || null,
      })
      setIsEditDialogOpen(false)
      setError(null)
    } catch (err) {
      console.error('[v0] Error updating order:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.'))
      return

    try {
      const supabase = createClient()
      console.log('[v0] Deleting order:', orderId)

      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (deleteError) throw new Error(deleteError.message)

      console.log('[v0] Order deleted successfully')
      router.push('/orders')
    } catch (err) {
      console.error('[v0] Error deleting order:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete order')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Order not found
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{order.order_number}</h1>
            <p className="text-muted-foreground mt-2">Order details and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Order</DialogTitle>
                <DialogDescription>
                  Update the order details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount (GHS)</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={editFormData.total_amount}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, total_amount: e.target.value })
                    }
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes for this order..."
                    value={editFormData.notes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
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
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{order.customers?.name || 'Unknown'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Order Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(order.order_date).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {order.total_amount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              statusColors[order.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
