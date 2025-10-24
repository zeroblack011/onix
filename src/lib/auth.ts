/**
 * Sistema de Autenticação
 * JWT + bcrypt para segurança
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import type { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

/**
 * Hash de senha
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verifica senha
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Gera JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Verifica JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Autentica usuário
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
      return null
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return null
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Remove senha do objeto retornado
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword as User,
      token,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Cria novo usuário
 */
export async function createUser(data: {
  name: string
  email: string
  password: string
  phone?: string
  document?: string
}): Promise<{ user: User; token: string }> {
  const hashedPassword = await hashPassword(data.password)

  const [user] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      document: data.document,
      role: 'client',
      credits: 0,
      tier: 'basic',
    })
    .returning()

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  const { password: _, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword as User,
    token,
  }
}

/**
 * Obtém usuário atual do token
 */
export async function getCurrentUser(token: string): Promise<User | null> {
  const payload = verifyToken(token)

  if (!payload) {
    return null
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.userId))

  if (!user) {
    return null
  }

  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword as User
}

/**
 * Middleware helper para verificar autenticação
 */
export async function requireAuth(
  request: Request
): Promise<{ user: User } | { error: string; status: number }> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Token não fornecido', status: 401 }
  }

  const token = authHeader.substring(7)
  const user = await getCurrentUser(token)

  if (!user) {
    return { error: 'Token inválido', status: 401 }
  }

  return { user }
}

/**
 * Verifica se usuário tem role específica
 */
export function requireRole(user: User, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role)
}
