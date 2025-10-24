/**
 * CONECTOR INTERCOM - Suporte Automatizado
 * Gerencia conversas, respostas automáticas e tickets
 */

import axios from 'axios'
import type { ConnectorResult } from '@/types'

export class IntercomConnector {
  private apiKey: string
  private appId: string
  private baseURL = 'https://api.intercom.io'

  constructor() {
    this.apiKey = process.env.INTERCOM_ACCESS_TOKEN!
    this.appId = process.env.INTERCOM_APP_ID!
  }

  /**
   * Cria ou atualiza usuário no Intercom
   */
  async createOrUpdateUser(params: {
    userId: string
    email: string
    name: string
    customAttributes?: Record<string, any>
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const response = await axios.post(
        `${this.baseURL}/contacts`,
        {
          external_id: params.userId,
          email: params.email,
          name: params.name,
          custom_attributes: params.customAttributes,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      return {
        success: true,
        data: response.data,
        executionTime: Date.now() - startTime,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Envia mensagem para usuário
   */
  async sendMessage(params: {
    userId: string
    message: string
    fromAdmin?: boolean
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          message_type: 'inapp',
          body: params.message,
          from: params.fromAdmin
            ? { type: 'admin', id: this.appId }
            : { type: 'user', id: params.userId },
          to: {
            type: 'user',
            id: params.userId,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      return {
        success: true,
        data: response.data,
        executionTime: Date.now() - startTime,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Cria nota em conversa
   */
  async createNote(params: {
    userId: string
    note: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const response = await axios.post(
        `${this.baseURL}/contacts/${params.userId}/notes`,
        {
          body: params.note,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      return {
        success: true,
        data: response.data,
        executionTime: Date.now() - startTime,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Adiciona tag ao usuário
   */
  async addTag(params: {
    userId: string
    tagName: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const response = await axios.post(
        `${this.baseURL}/contacts/${params.userId}/tags`,
        {
          name: params.tagName,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      return {
        success: true,
        data: response.data,
        executionTime: Date.now() - startTime,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Notifica cliente sobre atualização de pedido
   */
  async notifyOrderUpdate(params: {
    userId: string
    orderNumber: string
    status: string
    message: string
  }): Promise<ConnectorResult> {
    const statusEmojis: Record<string, string> = {
      pending: '⏳',
      processing: '🔄',
      completed: '✅',
      cancelled: '❌',
    }

    const emoji = statusEmojis[params.status] || '📦'
    const fullMessage = `${emoji} **Pedido #${params.orderNumber}**\n\n${params.message}`

    return this.sendMessage({
      userId: params.userId,
      message: fullMessage,
      fromAdmin: true,
    })
  }
}

export const intercomConnector = new IntercomConnector()
