'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      // Salva token
      localStorage.setItem('token', data.token)

      addToast({
        type: 'success',
        title: 'Login realizado!',
        description: 'Bem-vindo de volta',
      })

      // Redireciona para dashboard
      router.push('/client/dashboard')
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao fazer login',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <CardTitle>Bem-vindo de volta!</CardTitle>
          <CardDescription>Entre para acessar sua conta</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-primary-600 font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>

            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary-600 block"
            >
              ← Voltar para home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
