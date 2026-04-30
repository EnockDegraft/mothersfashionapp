'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, ShoppingCart, TrendingUp, Loader, AlertCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockCount: 0,
  })
  const [orderTrendData, setOrderTrendData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      console.log('[v0] Fetching report data...')

      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, order_date')

      if (ordersError) throw new Error(ordersError.message)

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, category')

      if (productsError) throw new Error(productsError.message)

      // Fetch inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity_on_hand, low_stock_level')

      if (inventoryError) throw new Error(inventoryError.message)

      // Process stats
      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
      const totalProducts = products?.length || 0
      const lowStockCount = inventory?.filter((inv) => inv.quantity_on_hand <= inv.low_stock_level).length || 0

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        lowStockCount,
      })

      // Generate mock trends (in production, aggregate from real data)
      setOrderTrendData([
        { month: 'Jan', orders: 12, revenue: 2400 },
        { month: 'Feb', orders: 18, revenue: 3600 },
        { month: 'Mar', orders: totalOrders, revenue: totalRevenue },
      ])

      // Process category data
      const categoryMap: Record<string, number> = {}
      products?.forEach((p) => {
        const cat = p.category || 'Uncategorized'
        categoryMap[cat] = (categoryMap[cat] || 0) + 1
      })

      const processedCategories = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }))

      setCategoryData(
        processedCategories.length > 0
          ? processedCategories
          : [
              { name: 'No Data', value: 1 },
            ]
      )

      console.log('[v0] Report data loaded successfully')
    } catch (err) {
      console.error('[v0] Error loading report data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-2">Track business performance and metrics</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Need reorder</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Order Trends</CardTitle>
            <CardDescription>Orders and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" />
                <Bar dataKey="revenue" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Key metrics and insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Average Order Value:</span>
            <span className="font-semibold">
              GHS {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Total Inventory Items:</span>
            <span className="font-semibold">{stats.totalProducts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reorder Alert Count:</span>
            <span className="font-semibold text-yellow-600">{stats.lowStockCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
