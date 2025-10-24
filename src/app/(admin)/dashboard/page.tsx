'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()

      if (data.success) {
        setDashboard(data.dashboard)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading size="lg" text="Carregando dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <div className="flex items-center gap-3">
              <Badge variant="success">Online</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="py-6">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(dashboard?.revenue?.today || 0)}
              </div>
              <div className="text-sm text-gray-600">Faturamento Hoje</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="text-3xl mb-2">📦</div>
              <div className="text-3xl font-bold text-blue-600">
                {dashboard?.orders?.newToday || 0}
              </div>
              <div className="text-sm text-gray-600">Novos Pedidos Hoje</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-3xl font-bold text-purple-600">
                {dashboard?.clients?.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total Clientes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-orange-600">
                {dashboard?.orders?.processing || 0}
              </div>
              <div className="text-sm text-gray-600">Em Processamento</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pedidos por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-bold">Pendentes</div>
                    <div className="text-sm text-gray-600">Aguardando pagamento</div>
                  </div>
                  <div className="text-2xl font-bold">{dashboard?.orders?.pending || 0}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-bold">Processando</div>
                    <div className="text-sm text-gray-600">Em andamento</div>
                  </div>
                  <div className="text-2xl font-bold">{dashboard?.orders?.processing || 0}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-bold">Concluídos</div>
                    <div className="text-sm text-gray-600">Entregues</div>
                  </div>
                  <div className="text-2xl font-bold">{dashboard?.orders?.completed || 0}</div>
                </div>
              </div>

              <Link
                href="/admin/orders"
                className="mt-4 block w-full py-2 text-center bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              >
                Gerenciar Pedidos
              </Link>
            </CardContent>
          </Card>

          {/* Pedidos Recentes */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard?.recentOrders?.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">#{order.orderNumber}</div>
                        <div className="text-sm text-gray-600">{order.serviceId}</div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-bold">{formatCurrency(order.amount)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                {(!dashboard?.recentOrders || dashboard.recentOrders.length === 0) && (
                  <div className="text-center py-8 text-gray-600">
                    Nenhum pedido recente
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Equipe */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-bold text-lg">{dashboard?.team?.online || 0}</div>
                    <div className="text-sm text-gray-600">Membros Online</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="font-bold text-lg">{dashboard?.team?.offline || 0}</div>
                    <div className="text-sm text-gray-600">Membros Offline</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
