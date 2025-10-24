/**
 * Testes básicos de autenticação
 */

import { describe, it, expect } from '@jest/globals'
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../src/lib/auth'

describe('Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'test123'
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(20)
    })

    it('should verify correct password', async () => {
      const password = 'test123'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword(password, hashed)

      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'test123'
      const hashed = await hashPassword(password)
      const isValid = await verifyPassword('wrong', hashed)

      expect(isValid).toBe(false)
    })
  })

  describe('JWT Tokens', () => {
    it('should generate valid token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'client',
      }

      const token = generateToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should verify valid token', () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        role: 'client',
      }

      const token = generateToken(payload)
      const decoded = verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(payload.userId)
      expect(decoded?.email).toBe(payload.email)
      expect(decoded?.role).toBe(payload.role)
    })

    it('should reject invalid token', () => {
      const decoded = verifyToken('invalid.token.here')

      expect(decoded).toBeNull()
    })
  })
})
