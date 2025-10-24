import { NextRequest, NextResponse } from 'next/server'
import { SERVICES_CATALOG } from '@/constants/services'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const service = SERVICES_CATALOG.find(s => s.slug === params.slug)

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      service,
    })
  } catch (error: any) {
    console.error('Get service error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar serviço' },
      { status: 500 }
    )
  }
}
