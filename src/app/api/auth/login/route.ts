import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { loginSchema } from '@/lib/validations/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Autentica usuário
    const result = await authenticateUser(email, password)

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      user: result.user,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
