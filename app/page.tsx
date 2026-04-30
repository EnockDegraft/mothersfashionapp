import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { Package, Users, ShoppingCart, BarChart3, Zap, Shield } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Real-time tracking of stock levels and automatic low-stock alerts',
    },
    {
      icon: ShoppingCart,
      title: 'Order Processing',
      description: 'Streamline both wholesale and online order workflows',
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Centralized customer records with contact information',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Data-driven insights for informed decision making',
    },
    {
      icon: Zap,
      title: 'Automated Tracking',
      description: 'Automatic logging of inventory transactions',
    },
    {
      icon: Shield,
      title: 'Secure Access',
      description: 'Role-based access control for admin and sales personnel',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mother Clothing Ltd.</h1>
            <div className="flex gap-3">
              <Link href="/auth/login">
                <Button variant="outline">Admin Login</Button>
              </Link>
              <Link href="/auth/employee-login">
                <Button>Employee Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
          Inventory & Order Management System
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
          Streamline your wholesale clothing business with our comprehensive
          record-keeping and inventory management solution
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <Button size="lg" className="px-8">
              Admin Login
            </Button>
          </Link>
          <Link href="/auth/employee-login">
            <Button size="lg" variant="outline" className="px-8">
              Employee Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Key Features</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your clothing business efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Benefits</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform how you manage your business operations
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Reduced Errors</h4>
                <p className="text-sm text-muted-foreground">
                  Eliminate manual record-keeping mistakes
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Real-time Visibility</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor inventory and orders instantly
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Better Decision Making</h4>
                <p className="text-sm text-muted-foreground">
                  Access comprehensive analytics and reports
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Improved Efficiency</h4>
                <p className="text-sm text-muted-foreground">
                  Automate repetitive tasks and workflows
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Scalability</h4>
                <p className="text-sm text-muted-foreground">
                  Grow your business without manual bottlenecks
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Customer Satisfaction</h4>
                <p className="text-sm text-muted-foreground">
                  Better order tracking and fulfillment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Mother Clothing Ltd. and streamline your inventory management today
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Mother Clothing Ltd. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
