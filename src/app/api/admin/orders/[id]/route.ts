import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { updateOrderStatusSchema } from '@/lib/validations/order'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    if (!requireRole(auth.user, ['admin', 'team'])) {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()

    // Validação
    const validation = updateOrderStatusSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { status, notes, clientNotes } = validation.data

    // Atualiza pedido
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        notes: notes || undefined,
        clientNotes: clientNotes || undefined,
        updatedAt: new Date(),
        ...(status === 'completed' && { deliveredAt: new Date() }),
      })
      .where(eq(orders.id, params.id))
      .returning()

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // TODO: Enviar notificação para cliente

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar pedido' },
      { status: 500 }
    )
  }
}
