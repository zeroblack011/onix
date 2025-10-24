import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { registerSchema } from '@/lib/validations/auth'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { gmailConnector } from '@/lib/connectors/gmail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, phone, document } = validation.data

    // Verifica se email já existe
    const [existingUser] = await db.select().from(users).where(eq(users.email, email))

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Cria usuário
    const result = await createUser({
      name,
      email,
      password,
      phone,
      document,
    })

    // Envia email de boas-vindas (async, não aguarda)
    gmailConnector.sendWelcomeEmail({
      to: email,
      customerName: name,
      credits: 0,
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      token: result.token,
      user: result.user,
    })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
