import { z } from 'zod'

export const createPaymentSchema = z.object({
  orderId: z.string().optional(),
  creditPackageId: z.string().optional(),
  amount: z.number().positive('Valor deve ser positivo'),
  method: z.enum(['pix', 'credit_card', 'boleto', 'paypal']),
  gateway: z.enum(['asaas', 'paypal', 'square']).optional(),
}).refine(
  (data) => data.orderId || data.creditPackageId,
  'Pedido ou pacote de créditos é obrigatório'
)

export const webhookAsaasSchema = z.object({
  event: z.string(),
  payment: z.object({
    id: z.string(),
    status: z.string(),
    value: z.number(),
    netValue: z.number().optional(),
    customer: z.string(),
    dueDate: z.string(),
    paymentDate: z.string().optional(),
  }),
})

export const webhookPayPalSchema = z.object({
  event_type: z.string(),
  resource: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.object({
      total: z.string(),
      currency: z.string(),
    }),
  }),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type WebhookAsaasInput = z.infer<typeof webhookAsaasSchema>
export type WebhookPayPalInput = z.infer<typeof webhookPayPalSchema>
