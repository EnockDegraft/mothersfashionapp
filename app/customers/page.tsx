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
import { Plus, Mail, Phone, Eye, Edit, Trash2, AlertCircle, Loader } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Customer {
  id: string
  name: string
  business_name: string | null
  contact_email: string
  contact_phone: string | null
  city: string | null
  state: string | null
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    business_name: '',
    contact_email: '',
    contact_phone: '',
    city: '',
    state: '',
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      console.log('[v0] Fetching customers from database...')
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true })

      if (fetchError) throw new Error(fetchError.message)

      console.log('[v0] Customers loaded successfully:', data)
      setCustomers(data || [])
      setFilteredCustomers(data || [])
    } catch (err) {
      console.error('[v0] Error loading customers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        customer.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return

    try {
      const supabase = createClient()
      console.log('[v0] Deleting customer:', id)
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (deleteError) throw new Error(deleteError.message)

      console.log('[v0] Customer deleted successfully')
      setCustomers(customers.filter((c) => c.id !== id))
      setIsViewDialogOpen(false)
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('[v0] Error deleting customer:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete customer')
    }
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsViewDialogOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditFormData({
      name: customer.name,
      business_name: customer.business_name || '',
      contact_email: customer.contact_email,
      contact_phone: customer.contact_phone || '',
      city: customer.city || '',
      state: customer.state || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      console.log('[v0] Updating customer:', selectedCustomer.id)

      const { error: updateError } = await supabase
        .from('customers')
        .update({
          name: editFormData.name,
          business_name: editFormData.business_name || null,
          contact_email: editFormData.contact_email,
          contact_phone: editFormData.contact_phone || null,
          city: editFormData.city || null,
          state: editFormData.state || null,
        })
        .eq('id', selectedCustomer.id)

      if (updateError) throw new Error(updateError.message)

      console.log('[v0] Customer updated successfully')
      const updatedCustomers = customers.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              name: editFormData.name,
              business_name: editFormData.business_name || null,
              contact_email: editFormData.contact_email,
              contact_phone: editFormData.contact_phone || null,
              city: editFormData.city || null,
              state: editFormData.state || null,
            }
          : c
      )
      setCustomers(updatedCustomers)
      setSelectedCustomer(null)
      setIsEditDialogOpen(false)
      setError(null)
    } catch (err) {
      console.error('[v0] Error updating customer:', err)
      setError(err instanceof Error ? err.message : 'Failed to update customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground mt-2">View and manage customer accounts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
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
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by name, business, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No customers found. Create one to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 hover:underline"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          {customer.name}
                        </Button>
                      </TableCell>
                      <TableCell>{customer.business_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {customer.contact_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.contact_phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {customer.contact_phone}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.city && customer.state
                          ? `${customer.city}, ${customer.state}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive"
                            onClick={() => handleDelete(customer.id)}
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

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View {selectedCustomer?.name || 'customer'} details and information
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-semibold">{selectedCustomer.contact_email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Business</Label>
                  <p className="font-semibold">{selectedCustomer.business_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-semibold">{selectedCustomer.contact_phone || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <p className="font-semibold">{selectedCustomer.city || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <p className="font-semibold">{selectedCustomer.state || '-'}</p>
                </div>
              </div>

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
                    handleEditCustomer(selectedCustomer)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedCustomer.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update {selectedCustomer?.name || 'customer'} details below.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  type="text"
                  placeholder="John Doe"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-business">Business Name</Label>
                <Input
                  id="edit-business"
                  type="text"
                  placeholder="Business Name"
                  value={editFormData.business_name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, business_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="john@example.com"
                  value={editFormData.contact_email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, contact_email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={editFormData.contact_phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, contact_phone: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    type="text"
                    placeholder="New York"
                    value={editFormData.city}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    type="text"
                    placeholder="NY"
                    value={editFormData.state}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, state: e.target.value })
                    }
                  />
                </div>
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
