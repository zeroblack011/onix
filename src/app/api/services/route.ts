import { NextRequest, NextResponse } from 'next/server'
import { SERVICES_CATALOG } from '@/constants/services'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const popular = searchParams.get('popular')
    const limit = searchParams.get('limit')

    let services = SERVICES_CATALOG

    // Filtros
    if (category) {
      services = services.filter(s => s.category === category)
    }

    if (popular === 'true') {
      services = services.filter(s => s.popular)
    }

    if (limit) {
      services = services.slice(0, parseInt(limit))
    }

    return NextResponse.json({
      success: true,
      services,
    })
  } catch (error: any) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar serviços' },
      { status: 500 }
    )
  }
}
