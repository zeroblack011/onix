/**
 * SISTEMA DE CACHE COM CLOUDFLARE KV
 *
 * Substitui cache em memória por KV distribuído
 * Perfeito para Workers com múltiplas instâncias
 */

import type { Env } from '@/lib/db/index-d1'

interface CacheConfig {
  ttl?: number // Time to live em segundos
  metadata?: Record<string, any>
}

/**
 * Sistema de Cache usando Cloudflare KV
 *
 * Vantagens do KV:
 * ✅ Persistente entre requests
 * ✅ Distribuído globalmente
 * ✅ Eventual consistency
 * ✅ Latência baixa (leituras ~1-10ms)
 * ✅ Unlimited reads
 *
 * Limitações:
 * ⚠️ Escritas: 1000/day (free), unlimited (paid)
 * ⚠️ Eventual consistency (pode levar até 60s para propagar)
 * ⚠️ Tamanho máximo por chave: 25 MB
 * ⚠️ Não é adequado para dados que mudam muito
 */
export class KVCacheSystem {
  constructor(private kv: KVNamespace) {}

  /**
   * Get valor do cache
   *
   * @param key - Chave do cache
   * @returns Valor ou null se não existir/expirou
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // KV suporta JSON nativo
      const value = await this.kv.get(key, { type: 'json' })

      return value as T | null
    } catch (error) {
      console.error('KV get error:', error)
      return null
    }
  }

  /**
   * Get valor como texto
   */
  async getText(key: string): Promise<string | null> {
    return await this.kv.get(key, { type: 'text' })
  }

  /**
   * Get valor como ArrayBuffer (para binários)
   */
  async getBuffer(key: string): Promise<ArrayBuffer | null> {
    return await this.kv.get(key, { type: 'arrayBuffer' })
  }

  /**
   * Get com metadata
   */
  async getWithMetadata<T>(key: string): Promise<{
    value: T | null
    metadata: Record<string, any> | null
  }> {
    const result = await this.kv.getWithMetadata(key, { type: 'json' })

    return {
      value: result.value as T | null,
      metadata: result.metadata,
    }
  }

  /**
   * Set valor no cache
   *
   * @param key - Chave do cache
   * @param value - Valor (será serializado como JSON)
   * @param config - Configuração (ttl, metadata)
   */
  async set(key: string, value: any, config?: CacheConfig): Promise<void> {
    try {
      const options: KVNamespacePutOptions = {}

      // TTL em segundos
      if (config?.ttl) {
        options.expirationTtl = config.ttl
      }

      // Metadata adicional
      if (config?.metadata) {
        options.metadata = config.metadata
      }

      // KV serializa JSON automaticamente
      await this.kv.put(key, JSON.stringify(value), options)
    } catch (error) {
      console.error('KV set error:', error)
    }
  }

  /**
   * Set com expiração em timestamp absoluto
   */
  async setWithExpiration(
    key: string,
    value: any,
    expirationTimestamp: number
  ): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), {
      expiration: expirationTimestamp,
    })
  }

  /**
   * Set valor como texto
   */
  async setText(key: string, value: string, config?: CacheConfig): Promise<void> {
    const options: KVNamespacePutOptions = {}

    if (config?.ttl) {
      options.expirationTtl = config.ttl
    }

    await this.kv.put(key, value, options)
  }

  /**
   * Delete do cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.kv.delete(key)
    } catch (error) {
      console.error('KV delete error:', error)
    }
  }

  /**
   * Delete múltiplas chaves
   */
  async delMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.del(key)))
  }

  /**
   * Lista chaves com prefixo
   *
   * @param prefix - Prefixo para filtrar
   * @param limit - Máximo de chaves (padrão 1000)
   * @returns Lista de chaves
   */
  async list(prefix?: string, limit = 1000): Promise<string[]> {
    const result = await this.kv.list({ prefix, limit })
    return result.keys.map(k => k.name)
  }

  /**
   * Clear cache com prefixo
   *
   * CUIDADO: Pode ser custoso se tiver muitas chaves
   */
  async clearPrefix(prefix: string): Promise<void> {
    const keys = await this.list(prefix)
    await this.delMany(keys)
  }

  /**
   * Verifica se chave existe
   */
  async has(key: string): Promise<boolean> {
    const value = await this.kv.get(key)
    return value !== null
  }
}

/**
 * Helper para obter instância do cache
 *
 * @param request - Request do Workers
 * @returns Instância do KVCacheSystem
 */
export function getCache(request: Request): KVCacheSystem {
  // @ts-ignore - Next.js on Pages injeta env
  const env = request.env as Env

  if (!env || !env.CACHE_KV) {
    throw new Error('KV binding (CACHE_KV) não encontrado. Verifique wrangler.toml')
  }

  return new KVCacheSystem(env.CACHE_KV)
}

/**
 * Decorator para cache de funções (async)
 *
 * @param ttl - Time to live em segundos
 * @returns Decorator
 */
export function cached(ttl: number = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Primeiro argumento deve ser request (para pegar KV)
      const request = args[0] as Request

      if (!request || !(request instanceof Request)) {
        throw new Error(`@cached decorator requer primeiro argumento ser Request`)
      }

      const cache = getCache(request)
      const cacheKey = `${propertyKey}:${JSON.stringify(args.slice(1))}`

      // Tenta pegar do cache
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Executa método
      const result = await originalMethod.apply(this, args)

      // Salva no cache (não bloqueia)
      cache.set(cacheKey, result, { ttl }).catch(console.error)

      return result
    }

    return descriptor
  }
}

/**
 * EXEMPLO DE USO:
 *
 * // Em uma API route:
 * import { getCache } from '@/lib/cache/kv'
 *
 * export async function GET(request: Request) {
 *   const cache = getCache(request)
 *
 *   // Tenta pegar do cache
 *   const cached = await cache.get<User[]>('users:all')
 *   if (cached) {
 *     return Response.json(cached)
 *   }
 *
 *   // Busca do banco
 *   const users = await db.select().from(usersTable)
 *
 *   // Salva no cache (1 hora)
 *   await cache.set('users:all', users, { ttl: 3600 })
 *
 *   return Response.json(users)
 * }
 */

/**
 * EXEMPLO COM DECORATOR:
 *
 * class UserService {
 *   @cached(3600) // Cache por 1 hora
 *   async getUsers(request: Request, filters?: any) {
 *     const db = getDb(request)
 *     return await db.select().from(users)
 *   }
 * }
 *
 * // Uso:
 * const service = new UserService()
 * const allUsers = await service.getUsers(request)
 * // Primeira chamada: busca do DB
 * // Segunda chamada: retorna do cache
 */

/**
 * PATTERNS DE CACHE:
 *
 * 1. Cache-Aside (mais comum):
 *    - Tenta ler do cache
 *    - Se miss, busca do DB
 *    - Escreve no cache
 *
 * 2. Write-Through:
 *    - Escreve no cache e DB simultaneamente
 *    - Garante consistência
 *
 * 3. Write-Behind:
 *    - Escreve no cache primeiro
 *    - Atualiza DB depois (async)
 *    - Melhor performance mas menos consistente
 */

/**
 * ESTRATÉGIAS DE INVALIDAÇÃO:
 *
 * 1. TTL (Time to Live):
 *    cache.set('key', value, { ttl: 3600 })
 *
 * 2. Por evento (manual):
 *    await cache.del('users:all') // Quando user é criado/atualizado
 *
 * 3. Por prefixo:
 *    await cache.clearPrefix('users:') // Limpa tudo relacionado a users
 *
 * 4. Por tag (usando metadata):
 *    await cache.set('key', value, {
 *      metadata: { tags: ['users', 'active'] }
 *    })
 */

/**
 * MIGRAÇÃO DO CÓDIGO EXISTENTE:
 *
 * ANTES (cache em memória):
 * ```typescript
 * import { cache } from '@/lib/cache/redis'
 * const cached = await cache.get('key')
 * await cache.set('key', value, { ttl: 3600 })
 * ```
 *
 * DEPOIS (KV):
 * ```typescript
 * import { getCache } from '@/lib/cache/kv'
 * const cache = getCache(request) // Precisa passar request
 * const cached = await cache.get('key')
 * await cache.set('key', value, { ttl: 3600 })
 * ```
 *
 * MUDANÇA PRINCIPAL:
 * - Precisa chamar getCache(request) em vez de importar instância global
 */

/**
 * CUSTO DO KV:
 *
 * Free Tier:
 * - 100,000 reads/day
 * - 1,000 writes/day
 * - 1 GB storage
 *
 * Paid ($5/month):
 * - Unlimited reads
 * - Unlimited writes
 * - 1 GB storage (+ $0.50/GB extra)
 *
 * Recomendação:
 * - Use para dados que mudam pouco
 * - Cache de queries pesadas
 * - Dados de configuração
 * - NÃO use para dados que mudam a cada request
 */
