/**
 * PROCESSADOR DE PEDIDOS - Sistema Híbrido
 * Automação inteligente com qualidade humana
 */

import { gmailConnector } from '@/lib/connectors/gmail'
import { googleDriveConnector } from '@/lib/connectors/google-drive'
import { intercomConnector } from '@/lib/connectors/intercom'
import { huggingfaceConnector } from '@/lib/connectors/huggingface'
import { db } from '@/lib/db'
import { orders, automationLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export class OrderProcessor {
  /**
   * Inicia processamento automático do pedido
   */
  async processNewOrder(orderId: string) {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId))

      if (!order) {
        throw new Error('Order not found')
      }

      // STEP 1: Email de confirmação
      await this.runAutomation(orderId, 'gmail', 'send_confirmation', async () => {
        return await gmailConnector.sendOrderConfirmation({
          to: order.formData.email,
          customerName: order.formData.name,
          orderNumber: order.orderNumber,
          serviceName: order.formData.serviceName,
          amount: order.amount,
        })
      })

      // STEP 2: Criar pasta no Google Drive
      await this.runAutomation(orderId, 'google_drive', 'create_folder', async () => {
        return await googleDriveConnector.createClientFolder({
          clientName: order.formData.name,
          clientId: order.userId,
        })
      })

      // STEP 3: Iniciar suporte no Intercom
      await this.runAutomation(orderId, 'intercom', 'create_user', async () => {
        return await intercomConnector.createOrUpdateUser({
          userId: order.userId,
          email: order.formData.email,
          name: order.formData.name,
          customAttributes: {
            order_number: order.orderNumber,
            service: order.formData.serviceName,
            order_status: order.status,
          },
        })
      })

      // STEP 4: Processar baseado no tipo
      if (order.processingType === 'automatic') {
        await this.processAutomaticOrder(orderId)
      } else if (order.processingType === 'hybrid') {
        await this.processHybridOrder(orderId)
      } else {
        await this.processManualOrder(orderId)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Processa pedidos automáticos (Proxies, Sites, etc)
   */
  private async processAutomaticOrder(orderId: string) {
    // Implementação específica por serviço
    // Ex: Para proxies, ativa automaticamente
    // Para sites, faz deploy automático via Vercel
  }

  /**
   * Processa pedidos híbridos (TikTok Shops, BMs)
   */
  private async processHybridOrder(orderId: string) {
    // Automação inicial + fila para equipe
    await db
      .update(orders)
      .set({
        status: 'processing',
        notes: 'Aguardando processamento da equipe',
      })
      .where(eq(orders.id, orderId))
  }

  /**
   * Processa pedidos manuais (LLC, Apps, Consultorias)
   */
  private async processManualOrder(orderId: string) {
    // Apenas documentação automática
    await db
      .update(orders)
      .set({
        status: 'pending',
        notes: 'Pedido recebido, aguardando processamento manual',
      })
      .where(eq(orders.id, orderId))
  }

  /**
   * Executa automação e registra log
   */
  private async runAutomation(
    orderId: string,
    connector: string,
    action: string,
    fn: () => Promise<any>
  ) {
    const startTime = Date.now()

    try {
      const result = await fn()

      await db.insert(automationLogs).values({
        id: uuidv4(),
        orderId,
        connector,
        action,
        status: result.success ? 'success' : 'failed',
        output: JSON.stringify(result.data),
        error: result.error,
        executionTime: Date.now() - startTime,
      })

      return result
    } catch (error: any) {
      await db.insert(automationLogs).values({
        id: uuidv4(),
        orderId,
        connector,
        action,
        status: 'failed',
        error: error.message,
        executionTime: Date.now() - startTime,
      })

      throw error
    }
  }
}

export const orderProcessor = new OrderProcessor()
