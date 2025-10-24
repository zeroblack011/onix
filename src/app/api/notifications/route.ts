import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db, notifications } from '@/lib/db'
import { eq, and, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, auth.user.id))

    if (unreadOnly) {
      query = query.where(and(eq(notifications.userId, auth.user.id), eq(notifications.read, false)))
    }

    const userNotifications = await query
      .orderBy(sql`${notifications.createdAt} DESC`)
      .limit(limit)

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
    })
  } catch (error: any) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar notificações' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { title, message, type, category, link } = body

    const [notification] = await db
      .insert(notifications)
      .values({
        id: crypto.randomUUID(),
        userId: auth.user.id,
        title,
        message,
        type: type || 'info',
        category: category || 'system',
        link,
        read: false,
      })
      .returning()

    return NextResponse.json({
      success: true,
      notification,
    })
  } catch (error: any) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar notificação' },
      { status: 500 }
    )
  }
}
