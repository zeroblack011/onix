import { NextRequest, NextResponse } from 'next/server'
import { webhookAsaasSchema } from '@/lib/validations/payment'
import { db, payments, orders } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { creditsSystem } from '@/lib/credits'
import { orderProcessor } from '@/lib/automation/order-processor'
import { gmailConnector } from '@/lib/connectors/gmail'
import { CREDIT_PACKAGES } from '@/constants/services'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    const validation = webhookAsaasSchema.safeParse(body)
    if (!validation.success) {
      console.error('Invalid webhook:', validation.error)
      return NextResponse.json({ received: false }, { status: 400 })
    }

    const { event, payment: asaasPayment } = validation.data

    // Ignora eventos que não são de pagamento confirmado
    if (event !== 'PAYMENT_RECEIVED' && event !== 'PAYMENT_CONFIRMED') {
      return NextResponse.json({ received: true })
    }

    // Busca pagamento no banco
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.gatewayTransactionId, asaasPayment.id))

    if (!payment) {
      console.error('Payment not found:', asaasPayment.id)
      return NextResponse.json({ received: false }, { status: 404 })
    }

    // Atualiza status do pagamento
    await db
      .update(payments)
      .set({
        status: 'completed',
        gatewayStatus: asaasPayment.status,
        paidAt: new Date(asaasPayment.paymentDate || Date.now()),
      })
      .where(eq(payments.id, payment.id))

    // Se for compra de créditos
    if (payment.creditPackageId) {
      const pkg = CREDIT_PACKAGES.find(p => p.id === payment.creditPackageId)

      if (pkg) {
        await creditsSystem.addCredits({
          userId: payment.userId,
          amount: pkg.credits,
          description: `Compra do pacote ${pkg.name}`,
          type: 'purchase',
          relatedPaymentId: payment.id,
        })

        // Email de confirmação (async)
        const user = await db.select().from(db.users).where(eq(db.users.id, payment.userId)).then(r => r[0])
        if (user) {
          gmailConnector.sendWelcomeEmail({
            to: user.email,
            customerName: user.name,
            credits: pkg.credits,
          }).catch(console.error)
        }
      }
    }

    // Se for pagamento de pedido
    if (payment.orderId) {
      await db
        .update(orders)
        .set({
          paymentStatus: 'paid',
          status: 'processing',
        })
        .where(eq(orders.id, payment.orderId))

      // Inicia processamento (async)
      orderProcessor.processNewOrder(payment.orderId).catch(console.error)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ received: false }, { status: 500 })
  }
}
