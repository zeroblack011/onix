import { NextRequest, NextResponse } from 'next/server'
import { CREDIT_PACKAGES } from '@/constants/services'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      packages: CREDIT_PACKAGES,
    })
  } catch (error: any) {
    console.error('Get packages error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pacotes' },
      { status: 500 }
    )
  }
}
