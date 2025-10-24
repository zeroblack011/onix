/**
 * Sistema de Cache com Redis
 * Para produção, use Upstash Redis
 */

interface CacheConfig {
  ttl?: number // Time to live em segundos
}

class CacheSystem {
  private cache: Map<string, { value: any; expires: number }> = new Map()

  /**
   * Get valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key)

    if (!cached) {
      return null
    }

    // Verifica se expirou
    if (Date.now() > cached.expires) {
      this.cache.delete(key)
      return null
    }

    return cached.value as T
  }

  /**
   * Set valor no cache
   */
  async set(key: string, value: any, config?: CacheConfig): Promise<void> {
    const ttl = config?.ttl || 3600 // 1 hora padrão
    const expires = Date.now() + ttl * 1000

    this.cache.set(key, { value, expires })
  }

  /**
   * Delete do cache
   */
  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  /**
   * Clear todo cache
   */
  async clear(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Verifica se chave existe
   */
  async has(key: string): Promise<boolean> {
    const cached = this.cache.get(key)

    if (!cached) {
      return false
    }

    if (Date.now() > cached.expires) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

export const cache = new CacheSystem()

/**
 * Decorator para cache de funções
 */
export function cached(ttl: number = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`

      // Tenta pegar do cache
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Executa método
      const result = await originalMethod.apply(this, args)

      // Salva no cache
      await cache.set(cacheKey, result, { ttl })

      return result
    }

    return descriptor
  }
}
