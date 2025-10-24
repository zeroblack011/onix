/**
 * CONECTOR PAYPAL - Pagamentos Internacionais
 */

import axios from 'axios'
import type { ConnectorResult } from '@/types'

export class PayPalConnector {
  private clientId: string
  private clientSecret: string
  private baseURL: string

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID!
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET!
    this.baseURL =
      process.env.PAYPAL_MODE === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
  }

  /**
   * Obtém access token
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const response = await axios.post(
      `${this.baseURL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data.access_token
  }

  /**
   * Cria pagamento
   */
  async createPayment(params: {
    amount: number
    currency: string
    description: string
    returnUrl: string
    cancelUrl: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const accessToken = await this.getAccessToken()

      const response = await axios.post(
        `${this.baseURL}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: params.currency,
                value: params.amount.toFixed(2),
              },
              description: params.description,
            },
          ],
          application_context: {
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const approvalUrl = response.data.links.find(
        (link: any) => link.rel === 'approve'
      )?.href

      return {
        success: true,
        data: {
          orderId: response.data.id,
          approvalUrl,
          status: response.data.status,
        },
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
   * Captura pagamento
   */
  async capturePayment(orderId: string): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const accessToken = await this.getAccessToken()

      const response = await axios.post(
        `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        success: true,
        data: {
          orderId: response.data.id,
          status: response.data.status,
          captureId: response.data.purchase_units[0].payments.captures[0].id,
        },
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
}

export const paypalConnector = new PayPalConnector()
