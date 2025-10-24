import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createPaymentSchema } from '@/lib/validations/payment'
import { db, payments } from '@/lib/db'
import { asaasGateway } from '@/lib/payments/asaas'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }

    const body = await request.json()

    // Validação
    const validation = createPaymentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { orderId, creditPackageId, amount, method } = validation.data

    // Cria pagamento no banco
    const paymentId = uuidv4()

    const [payment] = await db.insert(payments).values({
      id: paymentId,
      userId: auth.user.id,
      orderId,
      creditPackageId,
      amount,
      method,
      gateway: 'asaas',
      status: 'pending',
      currency: 'BRL',
    }).returning()

    // Cria cobrança no Asaas
    const charge = await asaasGateway.createCharge({
      customer: auth.user.id,
      amount,
      description: creditPackageId
        ? `Compra de créditos`
        : `Pedido #${orderId}`,
      paymentMethod: method === 'pix' ? 'PIX' : method === 'boleto' ? 'BOLETO' : 'CREDIT_CARD',
    })

    if (!charge.success) {
      return NextResponse.json(
        { success: false, error: 'Erro ao criar cobrança' },
        { status: 500 }
      )
    }

    // Atualiza com ID da cobrança
    await db
      .update(payments)
      .set({
        gatewayTransactionId: charge.chargeId,
        status: 'processing',
      })
      .where(eq(payments.id, paymentId))

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentId,
        status: 'pending',
        amount,
        pixQrCode: charge.pixQrCode,
        boletoUrl: charge.boletoUrl,
        invoiceUrl: charge.invoiceUrl,
      },
    })
  } catch (error: any) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
