import { z } from 'zod'

export const createOrderSchema = z.object({
  serviceId: z.string().min(1, 'Serviço é obrigatório'),
  paymentMethod: z.enum(['credits', 'pix', 'credit_card', 'boleto'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  formData: z.record(z.any()),
  useCredits: z.boolean().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'processing',
    'waiting_info',
    'completed',
    'cancelled',
    'refunded',
  ]),
  notes: z.string().optional(),
  clientNotes: z.string().optional(),
})

export const assignOrderSchema = z.object({
  orderId: z.string(),
  teamMemberId: z.string(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type AssignOrderInput = z.infer<typeof assignOrderSchema>
