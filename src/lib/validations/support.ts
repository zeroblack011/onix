import { z } from 'zod'

export const createTicketSchema = z.object({
  subject: z.string().min(5, 'Assunto deve ter no mínimo 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  category: z.enum(['technical', 'billing', 'general']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  orderId: z.string().optional(),
})

export const addMessageSchema = z.object({
  ticketId: z.string(),
  message: z.string().min(1, 'Mensagem não pode estar vazia'),
  attachments: z.array(z.string()).optional(),
  isInternal: z.boolean().optional(),
})

export const updateTicketSchema = z.object({
  status: z.enum(['open', 'waiting_client', 'waiting_team', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  assignedTo: z.string().optional(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type AddMessageInput = z.infer<typeof addMessageSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
