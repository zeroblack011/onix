/**
 * CONECTOR GMAIL - Automação de Emails
 * Envia emails automáticos para confirmações, notificações e follow-ups
 */

import { google } from 'googleapis'
import type { ConnectorResult } from '@/types'

const gmail = google.gmail('v1')

interface GmailConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  fromEmail: string
}

export class GmailConnector {
  private oauth2Client: any
  private config: GmailConfig

  constructor() {
    this.config = {
      clientId: process.env.GMAIL_CLIENT_ID!,
      clientSecret: process.env.GMAIL_CLIENT_SECRET!,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN!,
      fromEmail: process.env.GMAIL_FROM_EMAIL!,
    }

    this.oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret
    )

    this.oauth2Client.setCredentials({
      refresh_token: this.config.refreshToken,
    })
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

          <p>Você pode acompanhar o status do seu pedido no painel:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/orders/${params.orderNumber}"
             style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; margin: 10px 0;">
            Acompanhar Pedido
          </a>

          <p>Se tiver alguma dúvida, estamos à disposição!</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 12px;">
            Global Business Automation Suite<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #0ea5e9;">
              ${process.env.NEXT_PUBLIC_APP_URL}
            </a>
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
   * Envia email de pedido processado e entregue
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

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/orders/${params.orderNumber}"
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; margin: 10px 0;">
            Ver Detalhes
          </a>

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
      const subject = `🎉 Bem-vindo à ${process.env.NEXT_PUBLIC_APP_NAME}!`
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

          ${params.credits ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>💰 Você tem ${params.credits} créditos disponíveis!</strong></p>
            <p style="margin: 10px 0 0 0;">Use para contratar qualquer serviço.</p>
          </div>
          ` : ''}

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard"
             style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; margin: 10px 0;">
            Acessar Painel
          </a>

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
   * Método auxiliar para enviar email
   */
  private async sendEmail(params: {
    to: string
    subject: string
    html: string
  }): Promise<void> {
    const message = [
      `From: ${this.config.fromEmail}`,
      `To: ${params.to}`,
      `Subject: ${params.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      params.html,
    ].join('\n')

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    await gmail.users.messages.send({
      auth: this.oauth2Client,
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })
  }
}

export const gmailConnector = new GmailConnector()
