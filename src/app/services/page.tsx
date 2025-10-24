'use client'

import { useState, useEffect } from 'react'
import Link from 'link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchServices()
  }, [filter])

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('category', filter)
      }

      const response = await fetch(`/api/services?${params}`)
      const data = await response.json()

      if (data.success) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading size="lg" text="Carregando serviços..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Todos os Serviços</h1>
          <p className="text-gray-600 mt-2">
            17+ serviços premium para acelerar seu negócio
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'documents' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('documents')}
          >
            Documentos
          </Button>
          <Button
            variant={filter === 'shops' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('shops')}
          >
            TikTok Shops
          </Button>
          <Button
            variant={filter === 'infrastructure' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('infrastructure')}
          >
            Infraestrutura
          </Button>
          <Button
            variant={filter === 'marketing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('marketing')}
          >
            Marketing
          </Button>
        </div>

        {/* Grid de Serviços */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition">
              <CardHeader>
                {service.popular && (
                  <Badge variant="success" className="mb-2 w-fit">
                    Popular
                  </Badge>
                )}
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {service.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Preço */}
                  <div className="border-t pt-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">
                          {formatCurrency(service.price)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ou {service.credits} créditos
                        </div>
                      </div>
                      <Link href={`/services/${service.slug}`}>
                        <Button>Contratar</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
