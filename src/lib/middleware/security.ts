/**
 * Middleware de Segurança
 * CSRF, XSS, Input Sanitization
 */

import { NextRequest } from 'next/server'

/**
 * Sanitiza string para prevenir XSS
 */
export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitiza objeto recursivamente
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {}
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key])
    }
    return sanitized
  }

  return obj
}

/**
 * Valida origem da requisição
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ]

  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return false
  }

  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return false
  }

  return true
}

/**
 * Headers de segurança
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

/**
 * Valida webhook signature
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
