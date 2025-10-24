import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { db, users } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'

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
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        credits: users.credits,
        tier: users.tier,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'client'))

    if (search) {
      query = query.where(
        sql`${users.name} LIKE ${'%' + search + '%'} OR ${users.email} LIKE ${'%' + search + '%'}`
      )
    }

    const clients = await query.orderBy(sql`${users.createdAt} DESC`).limit(limit)

    return NextResponse.json({
      success: true,
      clients,
    })
  } catch (error: any) {
    console.error('Get clients error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}
