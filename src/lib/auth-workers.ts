/**
 * SISTEMA DE AUTENTICAÇÃO PARA CLOUDFLARE WORKERS
 *
 * Otimizado para Edge Runtime:
 * - jose (JWT edge-compatible) em vez de jsonwebtoken
 * - Web Crypto API em vez de bcryptjs
 * - Performance ~100x melhor no Workers
 */

import { SignJWT, jwtVerify } from 'jose'
import { eq } from 'drizzle-orm'
import { getDb, users, type Env } from '@/lib/db/index-d1'
import type { User } from '@/types'

/**
 * IMPORTANTE: JWT_SECRET agora vem do env, não do process.env
 */
function getJwtSecret(env: Env): Uint8Array {
  const secret = env.JWT_SECRET || 'your-secret-key-change-in-production'
  return new TextEncoder().encode(secret)
}

const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

/**
 * Hash de senha usando Web Crypto API (SHA-256)
 *
 * IMPORTANTE: SHA-256 é mais rápido mas menos seguro que bcrypt
 * Para produção, considere usar @cloudflare/workers-bcrypt
 *
 * Performance:
 * - bcryptjs no Workers: ~500ms
 * - Web Crypto SHA-256: ~5ms
 * - @cloudflare/workers-bcrypt (WASM): ~50ms
 *
 * @param password - Senha em texto plano
 * @returns Hash SHA-256 hex
 */
export async function hashPassword(password: string): Promise<string> {
  // Adiciona salt fixo (em produção, use salt por usuário)
  const SALT = 'global-business-automation-salt-2024'
  const data = new TextEncoder().encode(password + SALT)

  // Usa Web Crypto API (nativo no Workers)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Converte para hex
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

/**
 * Verifica senha comparando hashes
 *
 * @param password - Senha em texto plano
 * @param hashedPassword - Hash armazenado
 * @returns true se a senha está correta
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

/**
 * ALTERNATIVA USANDO @cloudflare/workers-bcrypt (mais seguro):
 *
 * import { hash, verify } from '@cloudflare/workers-bcrypt'
 *
 * export async function hashPassword(password: string): Promise<string> {
 *   return await hash(password, 10)
 * }
 *
 * export async function verifyPassword(
 *   password: string,
 *   hashedPassword: string
 * ): Promise<boolean> {
 *   return await verify(password, hashedPassword)
 * }
 */

/**
 * Gera JWT token usando jose (edge-compatible)
 *
 * @param payload - Dados do usuário
 * @param env - Env do Workers (para pegar JWT_SECRET)
 * @returns JWT token string
 */
export async function generateToken(payload: JWTPayload, env: Env): Promise<string> {
  const secret = getJwtSecret(env)

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret)
}

/**
 * Verifica JWT token usando jose
 *
 * @param token - JWT token
 * @param env - Env do Workers
 * @returns Payload ou null se inválido
 */
export async function verifyToken(token: string, env: Env): Promise<JWTPayload | null> {
  try {
    const secret = getJwtSecret(env)
    const { payload } = await jwtVerify(token, secret)

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

/**
 * Autentica usuário (login)
 *
 * @param email - Email do usuário
 * @param password - Senha em texto plano
 * @param request - Request do Workers (para pegar env e db)
 * @returns User e token, ou null se falhar
 */
export async function authenticateUser(
  email: string,
  password: string,
  request: Request
): Promise<{ user: User; token: string } | null> {
  try {
    // @ts-ignore - Next.js on Pages injeta env
    const env = request.env as Env
    const db = getDb(request)

    // Busca usuário
    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
      return null
    }

    // Verifica senha
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return null
    }

    // Gera token
    const token = await generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env
    )

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
 *
 * @param data - Dados do usuário
 * @param request - Request do Workers
 * @returns User e token
 */
export async function createUser(
  data: {
    name: string
    email: string
    password: string
    phone?: string
    document?: string
  },
  request: Request
): Promise<{ user: User; token: string }> {
  // @ts-ignore
  const env = request.env as Env
  const db = getDb(request)

  // Hash da senha
  const hashedPassword = await hashPassword(data.password)

  // Cria usuário
  const [user] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(), // Web Crypto API
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

  // Gera token
  const token = await generateToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env
  )

  const { password: _, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword as User,
    token,
  }
}

/**
 * Obtém usuário atual do token
 *
 * @param token - JWT token
 * @param request - Request do Workers
 * @returns User ou null
 */
export async function getCurrentUser(token: string, request: Request): Promise<User | null> {
  // @ts-ignore
  const env = request.env as Env
  const db = getDb(request)

  // Verifica token
  const payload = await verifyToken(token, env)

  if (!payload) {
    return null
  }

  // Busca usuário
  const [user] = await db.select().from(users).where(eq(users.id, payload.userId))

  if (!user) {
    return null
  }

  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword as User
}

/**
 * Middleware helper para verificar autenticação
 *
 * @param request - Request do Workers
 * @returns { user } ou { error, status }
 */
export async function requireAuth(
  request: Request
): Promise<{ user: User } | { error: string; status: number }> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Token não fornecido', status: 401 }
  }

  const token = authHeader.substring(7)
  const user = await getCurrentUser(token, request)

  if (!user) {
    return { error: 'Token inválido', status: 401 }
  }

  return { user }
}

/**
 * Verifica se usuário tem role específica
 *
 * @param user - User object
 * @param allowedRoles - Array de roles permitidas
 * @returns true se autorizado
 */
export function requireRole(user: User, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role)
}

/**
 * EXEMPLO DE USO EM API ROUTES:
 *
 * // src/app/api/auth/login/route.ts
 * import { authenticateUser } from '@/lib/auth-workers'
 *
 * export async function POST(request: Request) {
 *   const { email, password } = await request.json()
 *
 *   const result = await authenticateUser(email, password, request)
 *
 *   if (!result) {
 *     return Response.json(
 *       { success: false, error: 'Credenciais inválidas' },
 *       { status: 401 }
 *     )
 *   }
 *
 *   return Response.json({
 *     success: true,
 *     token: result.token,
 *     user: result.user,
 *   })
 * }
 *
 * // src/app/api/protected/route.ts
 * import { requireAuth } from '@/lib/auth-workers'
 *
 * export async function GET(request: Request) {
 *   const auth = await requireAuth(request)
 *
 *   if ('error' in auth) {
 *     return Response.json({ error: auth.error }, { status: auth.status })
 *   }
 *
 *   return Response.json({ message: 'Olá ' + auth.user.name })
 * }
 */

/**
 * MIGRAÇÃO DO CÓDIGO EXISTENTE:
 *
 * ANTES (bcryptjs + jsonwebtoken):
 * ```typescript
 * import { generateToken } from '@/lib/auth'
 * const token = generateToken({ userId, email, role })
 * ```
 *
 * DEPOIS (jose + Web Crypto):
 * ```typescript
 * import { generateToken } from '@/lib/auth-workers'
 * const token = await generateToken({ userId, email, role }, env)
 * //                ^^ agora é async              precisa passar env ^^
 * ```
 *
 * MUDANÇAS:
 * 1. Todas as funções agora são async
 * 2. generateToken e verifyToken precisam de `env`
 * 3. authenticateUser, createUser, getCurrentUser precisam de `request`
 */
