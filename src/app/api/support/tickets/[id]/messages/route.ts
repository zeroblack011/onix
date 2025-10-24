import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db, supportMessages, supportTickets } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { addMessageSchema } from '@/lib/validations/support'
import { v4 as uuidv4 } from 'uuid'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const messages = await db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.ticketId, params.id))
      .orderBy(supportMessages.createdAt)

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error: any) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    const validation = addMessageSchema.safeParse({ ...body, ticketId: params.id })
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { message, attachments, isInternal } = validation.data

    const [newMessage] = await db
      .insert(supportMessages)
      .values({
        id: uuidv4(),
        ticketId: params.id,
        userId: auth.user.id,
        message,
        attachments: attachments ? JSON.stringify(attachments) : null,
        isInternal: isInternal || false,
      })
      .returning()

    // Atualiza status do ticket para waiting_team se mensagem do cliente
    if (!isInternal) {
      await db
        .update(supportTickets)
        .set({
          status: 'waiting_team',
          updatedAt: new Date(),
        })
        .where(eq(supportTickets.id, params.id))
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    })
  } catch (error: any) {
    console.error('Add message error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao adicionar mensagem' },
      { status: 500 }
    )
  }
}
