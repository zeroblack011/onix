'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Order } from '@/types'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()

      if (data.success) {
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading size="lg" text="Carregando pedido..." />
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Pedido não encontrado</h2>
        </div>
      </div>
    )
  }

  const statusColors = {
    pending: 'warning',
    processing: 'info',
    waiting_info: 'warning',
    completed: 'success',
    cancelled: 'error',
    refunded: 'error',
  } as const

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-primary-600 hover:text-primary-700"
        >
          ← Voltar
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pedido #{order.orderNumber}</CardTitle>
                  <Badge variant={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Data do Pedido</p>
                    <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                  </div>

                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-gray-600">Previsão de Entrega</p>
                      <p className="font-medium">{formatDateTime(order.estimatedDelivery)}</p>
                    </div>
                  )}

                  {order.deliveredAt && (
                    <div>
                      <p className="text-sm text-gray-600">Entregue em</p>
                      <p className="font-medium">{formatDateTime(order.deliveredAt)}</p>
                    </div>
                  )}

                  {order.clientNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">Observações</p>
                      <p className="text-sm text-blue-800">{order.clientNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dados do Formulário */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Fornecidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(JSON.parse(order.formData as any)).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-bold text-lg">{formatCurrency(order.amount)}</span>
                  </div>

                  {order.paidWithCredits && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900">
                        ✓ Pago com créditos
                      </p>
                      <p className="text-sm text-green-700">
                        {order.creditsUsed} créditos utilizados
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Status Pagamento:</span>
                    <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Nossa equipe está pronta para ajudar
                </p>
                <button
                  onClick={() => router.push(`/client/support?orderId=${order.id}`)}
                  className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Abrir Ticket de Suporte
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
