/**
 * Rate Limiting Middleware
 * Previne abuso de API
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number // janela de tempo em ms
  maxRequests: number // máximo de requests na janela
}

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config

  return function checkRateLimit(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const record = store[identifier]

    // Se não existe ou expirou, cria novo
    if (!record || now > record.resetTime) {
      store[identifier] = {
        count: 1,
        resetTime: now + windowMs,
      }

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: store[identifier].resetTime,
      }
    }

    // Incrementa contador
    record.count++

    // Verifica se excedeu limite
    if (record.count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    }
  }
}

// Configurações pré-definidas
export const rateLimits = {
  strict: rateLimit({ windowMs: 60 * 1000, maxRequests: 10 }), // 10 req/min
  normal: rateLimit({ windowMs: 60 * 1000, maxRequests: 100 }), // 100 req/min
  loose: rateLimit({ windowMs: 60 * 1000, maxRequests: 500 }), // 500 req/min
}
