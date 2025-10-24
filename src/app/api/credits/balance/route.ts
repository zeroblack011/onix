import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { creditsSystem } from '@/lib/credits'
import { db, creditTransactions } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if ('error' in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }

    // Busca saldo
    const balance = await creditsSystem.getBalance(auth.user.id)

    // Busca histórico
    const history = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, auth.user.id))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(20)

    return NextResponse.json({
      success: true,
      balance: balance.balance,
      history,
    })
  } catch (error: any) {
    console.error('Get balance error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar saldo' },
      { status: 500 }
    )
  }
}
