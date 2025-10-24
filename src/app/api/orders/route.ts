import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createOrderSchema } from '@/lib/validations/order'
import { db, orders } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { SERVICES_CATALOG } from '@/constants/services'
import { creditsSystem } from '@/lib/credits'
import { orderProcessor } from '@/lib/automation/order-processor'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET - Lista pedidos do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = db.select().from(orders).where(eq(orders.userId, auth.user.id))

    if (status) {
      query = query.where(eq(orders.status, status as any))
    }

    const userOrders = await query

    return NextResponse.json({
      success: true,
      orders: userOrders,
    })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}

/**
 * POST - Cria novo pedido
 */
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
    const validation = createOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { serviceId, paymentMethod, formData, useCredits } = validation.data

    // Busca serviço
    const service = SERVICES_CATALOG.find(s => s.id === serviceId)
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Verifica créditos se necessário
    const paidWithCredits = paymentMethod === 'credits' || useCredits
    const amount = service.price
    const creditsNeeded = service.credits

    if (paidWithCredits) {
      const balance = await creditsSystem.getBalance(auth.user.id)

      if (!balance.success || balance.balance < creditsNeeded) {
        return NextResponse.json(
          { success: false, error: 'Créditos insuficientes' },
          { status: 400 }
        )
      }
    }

    // Cria pedido
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`
    const orderId = uuidv4()

    const [order] = await db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: auth.user.id,
      serviceId: service.id,
      amount,
      paidWithCredits,
      creditsUsed: paidWithCredits ? creditsNeeded : 0,
      status: paidWithCredits ? 'processing' : 'pending',
      paymentStatus: paidWithCredits ? 'paid' : 'pending',
      processingType: service.processingType,
      formData: JSON.stringify({
        ...formData,
        serviceName: service.name,
        email: auth.user.email,
        name: auth.user.name,
      }),
    }).returning()

    // Se pagou com créditos, debita e inicia processamento
    if (paidWithCredits) {
      await creditsSystem.debitCredits({
        userId: auth.user.id,
        amount: creditsNeeded,
        description: `Pagamento do pedido #${orderNumber} - ${service.name}`,
        relatedOrderId: orderId,
      })

      // Inicia processamento automático (async)
      orderProcessor.processNewOrder(orderId).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      order,
      requiresPayment: !paidWithCredits,
    })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}
