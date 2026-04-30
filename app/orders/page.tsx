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
import { Plus, Eye, Edit, Trash2, AlertCircle, Loader } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  order_date: string
  notes?: string | null
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

export default function OrdersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    total_amount: '',
    notes: '',
  })
  const [editFormData, setEditFormData] = useState({
    status: '',
    total_amount: '',
    notes: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      console.log('[v0] Fetching orders from database...')
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          order_date,
          notes,
          customers!inner (
            name
          )
        `)
        .order('order_date', { ascending: false })

      if (fetchError) throw new Error(fetchError.message)

      // Normalize customers array to object
      const normalizedOrders = (data || []).map((order: any) => ({
        ...order,
        customers: Array.isArray(order.customers) 
          ? order.customers[0] || null 
          : order.customers,
      }))

      console.log('[v0] Orders loaded successfully:', normalizedOrders)
      setOrders(normalizedOrders)
      setFilteredOrders(normalizedOrders)
    } catch (err) {
      console.error('[v0] Error loading orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOrders(filtered)
  }, [searchTerm, orders])

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setEditFormData({
      status: order.status,
      total_amount: order.total_amount.toString(),
      notes: order.notes ? order.notes.toString() : '',
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      console.log('[v0] Updating order:', selectedOrder.id)

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: editFormData.status,
          total_amount: parseFloat(editFormData.total_amount) || 0,
          notes: editFormData.notes || null,
        })
        .eq('id', selectedOrder.id)

      if (updateError) throw new Error(updateError.message)

      console.log('[v0] Order updated successfully')
      const updatedOrders = orders.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: editFormData.status,
              total_amount: parseFloat(editFormData.total_amount),
            }
          : o
      )
      setOrders(updatedOrders)
      setSelectedOrder(null)
      setIsEditDialogOpen(false)
      setError(null)
    } catch (err) {
      console.error('[v0] Error updating order:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return

    try {
      const supabase = createClient()
      console.log('[v0] Deleting order:', id)
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (deleteError) throw new Error(deleteError.message)

      console.log('[v0] Order deleted successfully')
      setOrders(orders.filter((o) => o.id !== id))
      setIsViewDialogOpen(false)
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('[v0] Error deleting order:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete order')
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customer_name.trim()) {
      setError('Please enter a customer name')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const orderNumber = `ORD-${Date.now()}`

      // First, get or create the customer
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .ilike('name', formData.customer_name)
        .single()

      let customerId: string
      if (existingCustomer?.id) {
        customerId = existingCustomer.id
      } else {
        // Create new customer if doesn't exist
        const { data: newCustomer, error: createCustomerError } = await supabase
          .from('customers')
          .insert([{ name: formData.customer_name }])
          .select('id')
          .single()
        
        if (createCustomerError) throw new Error(createCustomerError.message)
        customerId = newCustomer.id
      }

      const { data, error: createError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: customerId,
            order_number: orderNumber,
            order_date: formData.order_date,
            status: formData.status,
            total_amount: parseFloat(formData.total_amount) || 0,
            notes: formData.notes || null,
          },
        ])
        .select(`
          id,
          order_number,
          status,
          total_amount,
          order_date,
          notes,
          customers!inner (
            name
          )
        `)

      if (createError) throw new Error(createError.message)

      // Normalize the returned order
      const newOrder = {
        ...data[0],
        customers: Array.isArray(data[0].customers)
          ? data[0].customers[0] || null
          : data[0].customers,
      }

      console.log('[v0] Order created successfully:', newOrder)
      setOrders([newOrder, ...orders])
      setIsDialogOpen(false)
      setFormData({
        customer_name: '',
        order_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        total_amount: '',
        notes: '',
      })
      setError(null)
    } catch (err) {
      console.error('[v0] Error creating order:', err)
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-2">Track and manage customer orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Add a new order for a customer. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  type="text"
                  placeholder="Enter customer name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_date">Order Date</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) =>
                      setFormData({ ...formData, order_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount (GHS)</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.total_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, total_amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for this order..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Order'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by order number, customer, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No orders found. Create one to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 hover:underline"
                          onClick={() => handleViewOrder(order)}
                        >
                          {order.order_number}
                        </Button>
                      </TableCell>
                      <TableCell>{order.customers?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {new Date(order.order_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            statusColors[order.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>GHS {(order.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handleEditOrder(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive"
                            onClick={() => handleDelete(order.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View {selectedOrder?.order_number || 'order'} details and information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Order Number</Label>
                  <p className="font-semibold">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="font-semibold">{selectedOrder.customers?.name || 'Unknown'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Order Date</Label>
                  <p className="font-semibold">
                    {new Date(selectedOrder.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Amount</Label>
                  <p className="font-semibold">GHS {selectedOrder.total_amount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm whitespace-pre-wrap mt-2">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEditOrder(selectedOrder)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedOrder.id)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Update {selectedOrder?.order_number || 'order'} details below.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Order Number</Label>
                <p className="font-semibold">{selectedOrder.order_number}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Customer</Label>
                <p className="font-semibold">{selectedOrder.customers?.name || 'Unknown'}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
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
                <Label htmlFor="edit-total_amount">Total Amount (GHS)</Label>
                <Input
                  id="edit-total_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editFormData.total_amount}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, total_amount: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
