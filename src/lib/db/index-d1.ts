/**
 * DATABASE ADAPTER PARA CLOUDFLARE D1
 *
 * Este arquivo substitui src/lib/db/index.ts quando deployando no Workers
 *
 * IMPORTANTE: D1 é passado como binding do Workers, não como string de conexão
 */

import { drizzle } from 'drizzle-orm/d1'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './schema'

// Interface para os bindings do Cloudflare Workers
export interface Env {
  DB: D1Database // Binding do D1
  CACHE_KV: KVNamespace // Binding do KV para cache
  R2_BUCKET: R2Bucket // Binding do R2 para uploads

  // Secrets (configurados via wrangler secret put)
  JWT_SECRET: string
  GMAIL_CLIENT_ID: string
  GMAIL_CLIENT_SECRET: string
  GMAIL_REFRESH_TOKEN: string
  GMAIL_FROM_EMAIL: string
  ASAAS_API_KEY: string
  PAYPAL_CLIENT_ID: string
  PAYPAL_CLIENT_SECRET: string
  // ... outros secrets
}

/**
 * Cria instância do Drizzle ORM conectada ao D1
 *
 * IMPORTANTE: Esta função deve ser chamada em cada request
 * porque o binding DB é injetado pelo Workers runtime
 *
 * @example
 * // Em uma API route:
 * export async function GET(request: Request, { env }: { env: Env }) {
 *   const db = createDb(env)
 *   const users = await db.select().from(schema.users)
 *   return Response.json(users)
 * }
 */
export function createDb(env: Env): DrizzleD1Database<typeof schema> {
  return drizzle(env.DB, { schema })
}

/**
 * Helper para obter o binding DB do contexto do Workers
 *
 * Next.js on Workers injeta env via getLoadContext()
 */
export function getDb(request: Request): DrizzleD1Database<typeof schema> {
  // @ts-ignore - Next.js on Pages injeta env no request
  const env = request.env as Env

  if (!env || !env.DB) {
    throw new Error('D1 binding (DB) não encontrado. Verifique wrangler.toml')
  }

  return createDb(env)
}

/**
 * Helper para obter env completo do request
 */
export function getEnv(request: Request): Env {
  // @ts-ignore
  const env = request.env as Env

  if (!env) {
    throw new Error('Env não encontrado no request. Executando fora do Workers?')
  }

  return env
}

// Re-exporta schema para manter compatibilidade
export * from './schema'

/**
 * DIFERENÇAS ENTRE BETTER-SQLITE3 E D1:
 *
 * 1. CONEXÃO:
 *    - Better-SQLite3: new Database('file.db')
 *    - D1: Binding injetado pelo Workers runtime
 *
 * 2. QUERIES:
 *    - Better-SQLite3: Síncrono (db.prepare().all())
 *    - D1: SEMPRE assíncrono (await db.select())
 *
 * 3. PERFORMANCE:
 *    - Better-SQLite3: Local, muito rápido
 *    - D1: Distribuído globalmente, latência de rede (~10-50ms)
 *
 * 4. LIMITAÇÕES D1:
 *    - Escritas: 1000/min (free), ilimitado (paid)
 *    - Tamanho: 500MB (free), 10GB (paid)
 *    - JOINs: Evitar > 3 tabelas
 *    - Sem PRAGMA user_version
 *    - Sem extension loading
 *
 * 5. VANTAGENS D1:
 *    - Read replication global (baixa latência mundial)
 *    - Backups automáticos
 *    - Sem gerenciamento de servidor
 *    - Escala automaticamente
 *    - Integração nativa com Workers
 */

/**
 * EXEMPLO DE USO EM API ROUTES:
 *
 * // src/app/api/users/route.ts
 * import { getDb, users } from '@/lib/db/index-d1'
 *
 * export async function GET(request: Request) {
 *   const db = getDb(request)
 *   const allUsers = await db.select().from(users)
 *   return Response.json(allUsers)
 * }
 *
 * // Com filtros:
 * export async function GET(request: Request) {
 *   const db = getDb(request)
 *   const { searchParams } = new URL(request.url)
 *   const email = searchParams.get('email')
 *
 *   const result = await db.select()
 *     .from(users)
 *     .where(eq(users.email, email))
 *
 *   return Response.json(result)
 * }
 */

/**
 * EXEMPLO DE USO EM SERVER COMPONENTS:
 *
 * // src/app/(client)/dashboard/page.tsx
 * import { getDb, orders } from '@/lib/db/index-d1'
 * import { headers } from 'next/headers'
 *
 * export default async function DashboardPage() {
 *   const headersList = headers()
 *   const request = new Request('http://localhost', { headers: headersList })
 *
 *   const db = getDb(request)
 *   const userOrders = await db.select().from(orders)
 *
 *   return <div>{userOrders.length} pedidos</div>
 * }
 */

/**
 * MIGRAÇÃO DE CÓDIGO EXISTENTE:
 *
 * ANTES (better-sqlite3):
 * ```typescript
 * import { db } from '@/lib/db'
 * const users = await db.select().from(schema.users)
 * ```
 *
 * DEPOIS (D1):
 * ```typescript
 * import { getDb, users } from '@/lib/db/index-d1'
 * const db = getDb(request) // Precisa passar request!
 * const allUsers = await db.select().from(users)
 * ```
 *
 * MUDANÇA PRINCIPAL:
 * - `db` não é mais uma instância global
 * - Precisa chamar `getDb(request)` em cada request
 * - Request contém o binding do D1
 */
