'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Users, ShoppingCart, BarChart3, LogOut, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('mcSession')
    if (!session) {
      router.push('/auth/login')
      return
    }
    const parsed = JSON.parse(session)
    setIsAdmin(parsed.role === 'admin')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('mcSession')
    router.push('/auth/login')
  }

  const menuItems = [
    {
      title: 'Inventory',
      description: 'Manage products and stock levels',
      icon: Package,
      href: '/inventory',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Customers',
      description: 'View and manage customer records',
      icon: Users,
      href: '/customers',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Orders',
      description: 'Process and track orders',
      icon: ShoppingCart,
      href: '/orders',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Reports',
      description: 'View analytics and insights',
      icon: BarChart3,
      href: '/reports',
      color: 'from-orange-500 to-orange-600',
    },
    ...(isAdmin ? [{
      title: 'User Management',
      description: 'Create and manage employee accounts',
      icon: Settings,
      href: '/admin/users',
      color: 'from-red-500 to-red-600',
    }] : []),
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mother Clothing Ltd.</h1>
            <p className="text-muted-foreground">Inventory & Order Management System</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                      <div className={`bg-gradient-to-br ${item.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Go to {item.title}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
