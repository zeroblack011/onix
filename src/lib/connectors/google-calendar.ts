/**
 * CONECTOR GOOGLE CALENDAR - Agendamentos
 */

import { google } from 'googleapis'
import type { ConnectorResult } from '@/types'

const calendar = google.calendar('v3')

export class GoogleCalendarConnector {
  private oauth2Client: any

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID!,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET!
    )

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN!,
    })
  }

  /**
   * Cria evento no calendário
   */
  async createEvent(params: {
    summary: string
    description: string
    startTime: Date
    endTime: Date
    attendees?: string[]
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const event = await calendar.events.insert({
        auth: this.oauth2Client,
        calendarId: 'primary',
        requestBody: {
          summary: params.summary,
          description: params.description,
          start: {
            dateTime: params.startTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: params.endTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          attendees: params.attendees?.map(email => ({ email })),
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 },
            ],
          },
        },
      })

      return {
        success: true,
        data: {
          eventId: event.data.id,
          htmlLink: event.data.htmlLink,
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
   * Agenda follow-up de pedido
   */
  async scheduleOrderFollowUp(params: {
    orderNumber: string
    clientName: string
    clientEmail: string
    followUpDate: Date
  }): Promise<ConnectorResult> {
    const endTime = new Date(params.followUpDate)
    endTime.setHours(endTime.getHours() + 1)

    return this.createEvent({
      summary: `Follow-up: Pedido #${params.orderNumber}`,
      description: `Follow-up com ${params.clientName} sobre o pedido #${params.orderNumber}`,
      startTime: params.followUpDate,
      endTime,
      attendees: [params.clientEmail],
    })
  }
}

export const googleCalendarConnector = new GoogleCalendarConnector()
