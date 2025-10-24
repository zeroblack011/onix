import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { db, orders } from '@/lib/db'
import { eq, and, sql } from 'drizzle-orm'
import { updateOrderStatusSchema, assignOrderSchema } from '@/lib/validations/order'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    if (!requireRole(auth.user, ['admin', 'team'])) {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = db.select().from(orders)

    if (status) {
      query = query.where(eq(orders.status, status as any))
    }

    if (assignedTo) {
      query = query.where(eq(orders.assignedTo, assignedTo))
    }

    const allOrders = await query.orderBy(sql`${orders.createdAt} DESC`).limit(limit)

    return NextResponse.json({
      success: true,
      orders: allOrders,
    })
  } catch (error: any) {
    console.error('Get admin orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}
