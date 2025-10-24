import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { db, orders, users, payments, analytics } from '@/lib/db'
import { eq, gte, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    if (!requireRole(auth.user, ['admin', 'team'])) {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    // Data de hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Faturamento hoje
    const [todayRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
      .from(payments)
      .where(
        sql`${payments.status} = 'completed' AND ${payments.createdAt} >= ${today}`
      )

    // Pedidos por status
    const ordersByStatus = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .groupBy(orders.status)

    // Novos pedidos hoje
    const [newOrdersToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${today}`)

    // Total de clientes
    const [totalClients] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'client'))

    // Novos clientes hoje
    const [newClientsToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.role} = 'client' AND ${users.createdAt} >= ${today}`)

    // Pedidos recentes
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(10)

    // Equipe online (simulado - em produção viria de Redis/WebSocket)
    const teamOnline = 3
    const teamOffline = 2

    return NextResponse.json({
      success: true,
      dashboard: {
        revenue: {
          today: todayRevenue.total || 0,
          week: 0, // Implementar
          month: 0, // Implementar
        },
        orders: {
          pending: ordersByStatus.find(o => o.status === 'pending')?.count || 0,
          processing: ordersByStatus.find(o => o.status === 'processing')?.count || 0,
          completed: ordersByStatus.find(o => o.status === 'completed')?.count || 0,
          newToday: newOrdersToday.count || 0,
        },
        clients: {
          total: totalClients.count || 0,
          newToday: newClientsToday.count || 0,
          active: 0, // Implementar
        },
        team: {
          online: teamOnline,
          offline: teamOffline,
        },
        recentOrders,
      },
    })
  } catch (error: any) {
    console.error('Get admin dashboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dashboard' },
      { status: 500 }
    )
  }
}
