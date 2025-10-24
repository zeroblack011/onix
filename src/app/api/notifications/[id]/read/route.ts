import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db, notifications } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    // Marca como lida
    const [notification] = await db
      .update(notifications)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.id, params.id),
          eq(notifications.userId, auth.user.id)
        )
      )
      .returning()

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      notification,
    })
  } catch (error: any) {
    console.error('Mark notification read error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao marcar notificação' },
      { status: 500 }
    )
  }
}
