/**
 * CONECTOR GMAIL PARA CLOUDFLARE WORKERS
 *
 * Usa Gmail REST API com fetch em vez de googleapis
 * 100% compatível com Edge Runtime
 */

import type { ConnectorResult } from '@/types'
import type { Env } from '@/lib/db/index-d1'

interface GmailConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  fromEmail: string
}

interface EmailParams {
  to: string
  subject: string
  html: string
  cc?: string
  bcc?: string
}

/**
 * Gmail Connector otimizado para Workers
 *
 * Usa Gmail REST API v1 com fetch
 * Documentação: https://developers.google.com/gmail/api/reference/rest
 */
export class GmailConnectorWorkers {
  private config: GmailConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(env: Env) {
    this.config = {
      clientId: env.GMAIL_CLIENT_ID,
      clientSecret: env.GMAIL_CLIENT_SECRET,
      refreshToken: env.GMAIL_REFRESH_TOKEN,
      fromEmail: env.GMAIL_FROM_EMAIL,
    }
  }

  /**
   * Obtém access token do Google OAuth2
   *
   * Cache o token até expirar (1 hora geralmente)
   */
  private async getAccessToken(): Promise<string> {
    // Retorna token em cache se ainda válido
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    // Requisita novo token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get access token: ${error}`)
    }

    const data = await response.json()

    this.accessToken = data.access_token
    // Expira em 55 minutos (token dura 1h, mas renovamos antes)
    this.tokenExpiry = Date.now() + 55 * 60 * 1000

    return this.accessToken!
  }

  /**
   * Envia email usando Gmail API
   *
   * @param params - Parâmetros do email
   * @returns Promise<void>
   */
  private async sendEmail(params: EmailParams): Promise<void> {
    const accessToken = await this.getAccessToken()

    // Constrói mensagem RFC 2822
    const messageParts = [
      `From: ${this.config.fromEmail}`,
      `To: ${params.to}`,
      `Subject: ${params.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      params.html,
    ]

    if (params.cc) {
      messageParts.splice(2, 0, `Cc: ${params.cc}`)
    }

    if (params.bcc) {
      messageParts.splice(2, 0, `Bcc: ${params.bcc}`)
    }

    const message = messageParts.join('\r\n')

    // Encode em base64url (Gmail exige)
    const encodedMessage = base64UrlEncode(message)

    // Envia via Gmail API
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send email: ${error}`)
    }
  }

  /**
   * Envia email de confirmação de pedido
   */
  async sendOrderConfirmation(params: {
    to: string
    customerName: string
    orderNumber: string
    serviceName: string
    amount: number
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const subject = `✅ Pedido #${params.orderNumber} confirmado!`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Pedido Confirmado!</h2>

          <p>Olá <strong>${params.customerName}</strong>,</p>

          <p>Seu pedido foi confirmado e já está sendo processado! 🎉</p>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalhes do Pedido</h3>
            <p><strong>Número:</strong> #${params.orderNumber}</p>
            <p><strong>Serviço:</strong> ${params.serviceName}</p>
            <p><strong>Valor:</strong> R$ ${params.amount.toFixed(2)}</p>
          </div>

          <p>Você pode acompanhar o status do seu pedido no painel.</p>

          <p>Se tiver alguma dúvida, estamos à disposição!</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 12px;">
            Global Business Automation Suite
          </p>
        </div>
      `

      await this.sendEmail({
        to: params.to,
        subject,
        html,
      })

      return {
        success: true,
        data: { emailSent: true },
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
   * Envia email de pedido concluído
   */
  async sendOrderCompleted(params: {
    to: string
    customerName: string
    orderNumber: string
    serviceName: string
    deliveryNotes?: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const subject = `🎉 Pedido #${params.orderNumber} concluído!`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Pedido Concluído!</h2>

          <p>Olá <strong>${params.customerName}</strong>,</p>

          <p>Seu pedido foi processado e está pronto! 🚀</p>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalhes</h3>
            <p><strong>Pedido:</strong> #${params.orderNumber}</p>
            <p><strong>Serviço:</strong> ${params.serviceName}</p>
            ${params.deliveryNotes ? `<p><strong>Observações:</strong> ${params.deliveryNotes}</p>` : ''}
          </div>

          <p>Obrigado por confiar em nossos serviços! ❤️</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 12px;">
            Global Business Automation Suite
          </p>
        </div>
      `

      await this.sendEmail({
        to: params.to,
        subject,
        html,
      })

      return {
        success: true,
        data: { emailSent: true },
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
   * Envia email de boas-vindas
   */
  async sendWelcomeEmail(params: {
    to: string
    customerName: string
    credits?: number
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const subject = `🎉 Bem-vindo à Global Business Automation Suite!`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Bem-vindo(a)!</h2>

          <p>Olá <strong>${params.customerName}</strong>,</p>

          <p>É um prazer tê-lo(a) conosco! 🎉</p>

          <p>Nossa plataforma oferece <strong>17+ serviços premium</strong> para acelerar seu negócio digital:</p>

          <ul style="line-height: 1.8;">
            <li>🏢 LLCs nos EUA</li>
            <li>🛍️ TikTok Shops (BR/US/UK)</li>
            <li>🌐 Proxies Globais</li>
            <li>🤖 Marketing Automatizado com IA</li>
            <li>📱 Apps Personalizados</li>
            <li>E muito mais...</li>
          </ul>

          ${
            params.credits
              ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>💰 Você tem ${params.credits} créditos disponíveis!</strong></p>
            <p style="margin: 10px 0 0 0;">Use para contratar qualquer serviço.</p>
          </div>
          `
              : ''
          }

          <p>Qualquer dúvida, estamos à disposição 24/7!</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 12px;">
            Global Business Automation Suite
          </p>
        </div>
      `

      await this.sendEmail({
        to: params.to,
        subject,
        html,
      })

      return {
        success: true,
        data: { emailSent: true },
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
   * Envia email customizado
   */
  async sendCustomEmail(params: {
    to: string
    subject: string
    html: string
    cc?: string
    bcc?: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      await this.sendEmail(params)

      return {
        success: true,
        data: { emailSent: true },
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

/**
 * Helper para criar instância do conector
 *
 * @param request - Request do Workers (para pegar env)
 * @returns Instância do GmailConnectorWorkers
 */
export function createGmailConnector(request: Request): GmailConnectorWorkers {
  // @ts-ignore
  const env = request.env as Env
  return new GmailConnectorWorkers(env)
}

/**
 * Encode string para base64url (Gmail exige)
 *
 * Base64url é base64 com:
 * - + trocado por -
 * - / trocado por _
 * - = removido
 */
function base64UrlEncode(str: string): string {
  // Encode UTF-8 string to base64
  const base64 = btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  )

  // Convert to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * EXEMPLO DE USO:
 *
 * // Em uma API route ou função:
 * import { createGmailConnector } from '@/lib/connectors/gmail-workers'
 *
 * export async function POST(request: Request) {
 *   const gmailConnector = createGmailConnector(request)
 *
 *   const result = await gmailConnector.sendOrderConfirmation({
 *     to: 'cliente@example.com',
 *     customerName: 'João Silva',
 *     orderNumber: 'ORD-12345',
 *     serviceName: 'LLC EUA Completa',
 *     amount: 2997,
 *   })
 *
 *   if (!result.success) {
 *     console.error('Failed to send email:', result.error)
 *   }
 *
 *   return Response.json(result)
 * }
 */

/**
 * ALTERNATIVA: USAR CLOUDFLARE EMAIL ROUTING
 *
 * Se você tem Email Routing configurado no Cloudflare:
 *
 * export async function sendEmail(from: string, to: string, content: string) {
 *   // Workers pode enviar emails diretamente via Email Workers
 *   // https://developers.cloudflare.com/email-routing/email-workers/
 * }
 *
 * Vantagens:
 * - Mais simples
 * - Sem configuração OAuth
 * - Integrado com Cloudflare
 *
 * Desvantagens:
 * - Precisa Email Routing configurado
 * - Menos controle sobre o envio
 */

/**
 * ALTERNATIVA: USAR RESEND.COM OU SENDGRID
 *
 * Serviços de email mais simples para Workers:
 *
 * // Resend (recomendado)
 * const response = await fetch('https://api.resend.com/emails', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${RESEND_API_KEY}`,
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     from: 'onboarding@resend.dev',
 *     to: 'cliente@example.com',
 *     subject: 'Hello World',
 *     html: '<strong>It works!</strong>',
 *   }),
 * })
 *
 * Resend é mais fácil que Gmail API e funciona perfeitamente no Workers.
 */
