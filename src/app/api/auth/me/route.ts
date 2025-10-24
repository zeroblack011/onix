import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)

    if ('error' in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }

    return NextResponse.json({
      success: true,
      user: auth.user,
    })
  } catch (error: any) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}
