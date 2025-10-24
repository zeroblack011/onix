'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { DynamicForm } from '@/components/forms/dynamic-form'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import type { Service } from '@/types'

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchService()
  }, [params.slug])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${params.slug}`)
      const data = await response.json()

      if (data.success) {
        setService(data.service)
      }
    } catch (error) {
      console.error('Error fetching service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: Record<string, any>) => {
    const token = localStorage.getItem('token')

    if (!token) {
      addToast({
        type: 'warning',
        title: 'Login necessário',
        description: 'Faça login para contratar serviços',
      })
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service?.id,
          paymentMethod: 'credits',
          formData,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      addToast({
        type: 'success',
        title: 'Pedido criado!',
        description: `Pedido #${data.order.orderNumber} em processamento`,
      })

      router.push(`/client/orders/${data.order.id}`)
    } catch (error: any) {
      throw error
    }
  }

  if (loading) {
    return <Loading size="lg" text="Carregando serviço..." />
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Serviço não encontrado</h2>
          <Button onClick={() => router.push('/services')}>Ver todos os serviços</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info do Serviço */}
          <div>
            <Card>
              <CardHeader>
                {service.popular && (
                  <Badge variant="success" className="mb-2 w-fit">
                    Popular
                  </Badge>
                )}
                <CardTitle className="text-3xl">{service.name}</CardTitle>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {/* Preço */}
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="text-4xl font-bold text-primary-600">
                      {formatCurrency(service.price)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ou {service.credits} créditos
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="font-bold mb-3">O que está incluído:</h3>
                    <div className="space-y-2">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5">✓</span>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processamento */}
                  <div>
                    <h3 className="font-bold mb-2">Tempo de Entrega:</h3>
                    <Badge variant="info">{service.estimatedTime}</Badge>
                  </div>

                  {showForm ? (
                    <Button variant="outline" onClick={() => setShowForm(false)} className="w-full">
                      Voltar
                    </Button>
                  ) : (
                    <Button onClick={() => setShowForm(true)} className="w-full">
                      Contratar Agora
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <div>
            {showForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Preencha os Dados</CardTitle>
                  <CardDescription>
                    Complete o formulário para contratar o serviço
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DynamicForm
                    fields={service.formFields}
                    onSubmit={handleSubmit}
                    submitLabel="Finalizar Contratação"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Como Funciona</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="font-bold text-primary-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Preencha o Formulário</h4>
                        <p className="text-sm text-gray-600">
                          Forneça as informações necessárias
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="font-bold text-primary-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Realize o Pagamento</h4>
                        <p className="text-sm text-gray-600">
                          PIX, cartão ou créditos da plataforma
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="font-bold text-primary-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Receba o Serviço</h4>
                        <p className="text-sm text-gray-600">
                          Tempo estimado: {service.estimatedTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
