/**
 * GATEWAY ASAAS - Pagamentos Brasil
 * PIX, Cartão de Crédito e Boleto
 */

import axios from 'axios'
import type { Payment } from '@/types'

export class AsaasGateway {
  private apiKey: string
  private baseURL = 'https://api.asaas.com/v3'

  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY!
  }

  /**
   * Cria cobrança
   */
  async createCharge(params: {
    customer: string
    amount: number
    description: string
    paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
    dueDate?: Date
  }) {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments`,
        {
          customer: params.customer,
          billingType: params.paymentMethod,
          value: params.amount,
          dueDate: params.dueDate || new Date(),
          description: params.description,
        },
        {
          headers: {
            'access_token': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        success: true,
        chargeId: response.data.id,
        invoiceUrl: response.data.invoiceUrl,
        pixQrCode: response.data.pixQrCode,
        boletoUrl: response.data.bankSlipUrl,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Verifica status do pagamento
   */
  async checkPaymentStatus(chargeId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/payments/${chargeId}`, {
        headers: { 'access_token': this.apiKey },
      })

      return {
        success: true,
        status: response.data.status,
        paid: response.data.status === 'RECEIVED',
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}

export const asaasGateway = new AsaasGateway()
