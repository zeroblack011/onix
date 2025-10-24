import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db, supportTickets } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'
import { createTicketSchema } from '@/lib/validations/support'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, auth.user.id))

    if (status) {
      query = query.where(eq(supportTickets.status, status as any))
    }

    const tickets = await query.orderBy(sql`${supportTickets.createdAt} DESC`)

    return NextResponse.json({
      success: true,
      tickets,
    })
  } catch (error: any) {
    console.error('Get tickets error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar tickets' },
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

    const validation = createTicketSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { subject, description, category, priority, orderId } = validation.data

    const ticketNumber = `TKT-${Date.now().toString().slice(-8)}`

    const [ticket] = await db
      .insert(supportTickets)
      .values({
        id: uuidv4(),
        ticketNumber,
        userId: auth.user.id,
        subject,
        description,
        category,
        priority: priority || 'normal',
        status: 'open',
        orderId,
      })
      .returning()

    return NextResponse.json({
      success: true,
      ticket,
    })
  } catch (error: any) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar ticket' },
      { status: 500 }
    )
  }
}
