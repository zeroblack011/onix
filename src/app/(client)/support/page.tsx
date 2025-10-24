'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import type { SupportTicket } from '@/types'

export default function SupportPage() {
  const { addToast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'normal',
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/support/tickets', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      addToast({
        type: 'success',
        title: 'Ticket criado!',
        description: `Ticket #${data.ticket.ticketNumber} aberto com sucesso`,
      })

      setShowForm(false)
      setFormData({ subject: '', description: '', category: 'general', priority: 'normal' })
      fetchTickets()
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    open: 'info',
    waiting_client: 'warning',
    waiting_team: 'warning',
    resolved: 'success',
    closed: 'secondary',
  } as const

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Suporte</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Ver Tickets' : '+ Novo Ticket'}
          </Button>
        </div>

        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Abrir Novo Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject" required>Assunto</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    minLength={5}
                  />
                </div>

                <div>
                  <Label htmlFor="category" required>Categoria</Label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={[
                      { value: 'technical', label: 'Técnico' },
                      { value: 'billing', label: 'Financeiro' },
                      { value: 'general', label: 'Geral' },
                    ]}
                  />
                </div>

                <div>
                  <Label htmlFor="priority" required>Prioridade</Label>
                  <Select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    options={[
                      { value: 'low', label: 'Baixa' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'high', label: 'Alta' },
                      { value: 'urgent', label: 'Urgente' },
                    ]}
                  />
                </div>

                <div>
                  <Label htmlFor="description" required>Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    minLength={20}
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                  Enviar Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">Você ainda não tem tickets de suporte</p>
                  <Button onClick={() => setShowForm(true)}>
                    Abrir Primeiro Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-lg transition cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{ticket.subject}</h3>
                          <Badge variant={statusColors[ticket.status]}>
                            {ticket.status}
                          </Badge>
                          <Badge variant="secondary">
                            {ticket.ticketNumber}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Categoria: {ticket.category}</span>
                          <span>Prioridade: {ticket.priority}</span>
                          <span>Criado: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
