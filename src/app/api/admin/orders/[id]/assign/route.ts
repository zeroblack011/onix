import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    if (!requireRole(auth.user, ['admin'])) {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { teamMemberId } = body

    if (!teamMemberId) {
      return NextResponse.json(
        { success: false, error: 'ID do membro é obrigatório' },
        { status: 400 }
      )
    }

    // Atribui pedido
    const [updatedOrder] = await db
      .update(orders)
      .set({
        assignedTo: teamMemberId,
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, params.id))
      .returning()

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error: any) {
    console.error('Assign order error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atribuir pedido' },
      { status: 500 }
    )
  }
}
