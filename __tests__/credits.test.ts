/**
 * Testes do sistema de créditos
 */

import { describe, it, expect } from '@jest/globals'
import { creditsSystem } from '../src/lib/credits'

describe('Credits System', () => {
  describe('Calculate Best Package', () => {
    it('should recommend Starter for 500 credits', () => {
      const result = creditsSystem.calculateBestPackage(500)

      expect(result.recommended).toBe(true)
      expect(result.package?.name).toBe('Starter')
      expect(result.package?.credits).toBe(600)
    })

    it('should recommend Business for 1000 credits', () => {
      const result = creditsSystem.calculateBestPackage(1000)

      expect(result.recommended).toBe(true)
      expect(result.package?.name).toBe('Business')
      expect(result.package?.credits).toBe(1400)
    })

    it('should recommend Premium for 3000 credits', () => {
      const result = creditsSystem.calculateBestPackage(3000)

      expect(result.recommended).toBe(true)
      expect(result.package?.name).toBe('Premium')
      expect(result.package?.credits).toBe(5000)
    })

    it('should calculate savings correctly', () => {
      const result = creditsSystem.calculateBestPackage(500)

      expect(result.recommended).toBe(true)
      expect(result.savings).toBeGreaterThan(0)
    })
  })
})
