/**
 * SISTEMA DE CRÉDITOS
 * Gerenciamento completo de créditos do cliente
 */

import { db } from '@/lib/db'
import { users, creditTransactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export class CreditsSystem {
  /**
   * Adiciona créditos ao usuário
   */
  async addCredits(params: {
    userId: string
    amount: number
    description: string
    type: 'purchase' | 'bonus' | 'refund'
    relatedPaymentId?: string
  }) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, params.userId))

      if (!user) {
        throw new Error('User not found')
      }

      const newBalance = user.credits + params.amount

      // Atualiza saldo do usuário
      await db
        .update(users)
        .set({ credits: newBalance })
        .where(eq(users.id, params.userId))

      // Registra transação
      await db.insert(creditTransactions).values({
        id: uuidv4(),
        userId: params.userId,
        type: params.type,
        amount: params.amount,
        balance: newBalance,
        description: params.description,
        relatedPaymentId: params.relatedPaymentId,
      })

      return {
        success: true,
        newBalance,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Debita créditos do usuário
   */
  async debitCredits(params: {
    userId: string
    amount: number
    description: string
    relatedOrderId?: string
  }) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, params.userId))

      if (!user) {
        throw new Error('User not found')
      }

      if (user.credits < params.amount) {
        throw new Error('Insufficient credits')
      }

      const newBalance = user.credits - params.amount

      // Atualiza saldo
      await db
        .update(users)
        .set({ credits: newBalance })
        .where(eq(users.id, params.userId))

      // Registra transação
      await db.insert(creditTransactions).values({
        id: uuidv4(),
        userId: params.userId,
        type: 'usage',
        amount: -params.amount,
        balance: newBalance,
        description: params.description,
        relatedOrderId: params.relatedOrderId,
      })

      return {
        success: true,
        newBalance,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Obtém saldo do usuário
   */
  async getBalance(userId: string) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId))

      if (!user) {
        throw new Error('User not found')
      }

      return {
        success: true,
        balance: user.credits,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Calcula melhor pacote de créditos para compra
   */
  calculateBestPackage(totalPrice: number) {
    const packages = [
      { name: 'Starter', price: 497, credits: 600, discount: 20 },
      { name: 'Business', price: 997, credits: 1400, discount: 40 },
      { name: 'Premium', price: 2997, credits: 5000, discount: 67 },
      { name: 'Empire', price: 4997, credits: 10000, discount: 100 },
    ]

    const bestPackage = packages.find(pkg => pkg.credits >= totalPrice)

    if (bestPackage) {
      const savings = totalPrice - bestPackage.price

      return {
        recommended: true,
        package: bestPackage,
        savings: savings > 0 ? savings : 0,
        message: savings > 0
          ? `Economize R$ ${savings.toFixed(2)} comprando o pacote ${bestPackage.name}!`
          : `Pacote ${bestPackage.name} recomendado`,
      }
    }

    return {
      recommended: false,
      message: 'Compra direta recomendada',
    }
  }
}

export const creditsSystem = new CreditsSystem()
