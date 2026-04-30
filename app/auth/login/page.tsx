'use client'

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
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Hardcoded admin credentials
  const ADMIN_EMAIL = 'admin@motherclothing.com'
  const ADMIN_PASSWORD = 'Admin@2024'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate network delay
    setTimeout(() => {
      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Store admin session
        localStorage.setItem(
          'mcSession',
          JSON.stringify({
            email: ADMIN_EMAIL,
            role: 'admin',
            loginTime: new Date().toISOString(),
          })
        )
        router.push('/protected')
      } else {
        setError('Invalid email or password. Use admin credentials to login.')
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <div 
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10"
      style={{
        backgroundImage: 'url(/login-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold">Mother Clothing Ltd.</CardTitle>
            <CardDescription className='font-bold text-lg'>
              Admin Login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@motherclothing.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 border border-red-200">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="rounded-md bg-blue-50 p-3 border border-blue-200 hidden">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Demo Admin Account:
                </p>
                <p className="text-xs text-blue-800 mb-1">
                  <span className="font-medium">Email:</span> admin@motherclothing.com
                </p>
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Password:</span> Admin@2024
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login as Admin'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div className="text-center text-sm">
                Employee?{' '}
                <Link
                  href="/auth/employee-login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Login as Employee
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
