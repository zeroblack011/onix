import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, params.id))

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se o pedido pertence ao usuário (ou se é admin)
    if (order.userId !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Sem permissão' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pedido' },
      { status: 500 }
    )
  }
}
