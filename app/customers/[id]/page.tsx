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
import { ArrowLeft, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    business_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [customerId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [customerResult, ordersResult] = await Promise.all([
        supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single(),
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
      ])

      if (customerResult.error) throw customerResult.error
      if (ordersResult.error) throw ordersResult.error

      const customerData = customerResult.data
      setCustomer(customerData)
      setFormData({
        name: customerData.name,
        contact_email: customerData.contact_email,
        contact_phone: customerData.contact_phone || '',
        business_name: customerData.business_name || '',
        address: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        postal_code: customerData.postal_code || '',
        country: customerData.country || '',
      })
      setOrders(ordersResult.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', customerId)

      if (error) throw error
      setEditing(false)
      loadData()
    } catch (error) {
      console.error('Error updating customer:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </main>
    )
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={() => router.back()} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12 text-muted-foreground">
            Customer not found
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link href="/customers">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{customer.name}</h1>
              <p className="text-muted-foreground">Customer Profile & Order History</p>
            </div>
            {!editing && (
              <Button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            business_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="contact_email">Email</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact_email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contact_phone">Phone</Label>
                        <Input
                          id="contact_phone"
                          value={formData.contact_phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact_phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          value={formData.postal_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              postal_code: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSave} className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setEditing(false)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="text-lg font-semibold">{customer.name}</p>
                    </div>
                    {customer.business_name && (
                      <div>
                        <p className="text-sm text-muted-foreground">Business Name</p>
                        <p className="text-lg font-semibold">
                          {customer.business_name}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Email</p>
                        </div>
                        <p className="text-lg font-semibold">
                          {customer.contact_email}
                        </p>
                      </div>
                      {customer.contact_phone && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Phone</p>
                          </div>
                          <p className="text-lg font-semibold">
                            {customer.contact_phone}
                          </p>
                        </div>
                      )}
                    </div>
                    {customer.address && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Address</p>
                        </div>
                        <p className="text-lg font-semibold">{customer.address}</p>
                        {customer.city && (
                          <p className="text-muted-foreground">
                            {customer.city}
                            {customer.state && `, ${customer.state}`}
                            {customer.postal_code && ` ${customer.postal_code}`}
                          </p>
                        )}
                        {customer.country && (
                          <p className="text-muted-foreground">{customer.country}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <p className="text-muted-foreground text-sm">Total Orders</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <div className="text-center pb-4 border-b">
                  <p className="text-muted-foreground text-sm">Total Spent</p>
                  <p className="text-3xl font-bold">
                    $
                    {orders
                      .reduce((sum, order) => sum + (order.total_amount || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Average Order</p>
                  <p className="text-3xl font-bold">
                    $
                    {orders.length > 0
                      ? (
                          orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) /
                          orders.length
                        ).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="capitalize">
                          {order.order_type}
                        </TableCell>
                        <TableCell>{order.order_items?.length || 0}</TableCell>
                        <TableCell className="font-semibold">
                          ${order.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.status === 'confirmed'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.order_date), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
