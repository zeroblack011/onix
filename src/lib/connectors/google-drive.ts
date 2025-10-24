/**
 * CONECTOR GOOGLE DRIVE - Armazenamento de Documentos
 * Cria pastas para clientes e armazena documentos automaticamente
 */

import { google } from 'googleapis'
import type { ConnectorResult } from '@/types'

const drive = google.drive('v3')

export class GoogleDriveConnector {
  private oauth2Client: any
  private mainFolderId: string

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID!,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET!
    )

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN!,
    })

    this.mainFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!
  }

  /**
   * Cria pasta para o cliente
   */
  async createClientFolder(params: {
    clientName: string
    clientId: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const folderName = `${params.clientName} - ${params.clientId}`

      const folder = await drive.files.create({
        auth: this.oauth2Client,
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [this.mainFolderId],
        },
        fields: 'id, webViewLink',
      })

      return {
        success: true,
        data: {
          folderId: folder.data.id,
          folderUrl: folder.data.webViewLink,
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
   * Cria pasta para pedido específico
   */
  async createOrderFolder(params: {
    orderNumber: string
    serviceName: string
    clientFolderId: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const folderName = `Pedido #${params.orderNumber} - ${params.serviceName}`

      const folder = await drive.files.create({
        auth: this.oauth2Client,
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [params.clientFolderId],
        },
        fields: 'id, webViewLink',
      })

      return {
        success: true,
        data: {
          folderId: folder.data.id,
          folderUrl: folder.data.webViewLink,
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
   * Upload de arquivo
   */
  async uploadFile(params: {
    fileName: string
    fileBuffer: Buffer
    mimeType: string
    folderId: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const file = await drive.files.create({
        auth: this.oauth2Client,
        requestBody: {
          name: params.fileName,
          parents: [params.folderId],
        },
        media: {
          mimeType: params.mimeType,
          body: require('stream').Readable.from(params.fileBuffer),
        },
        fields: 'id, webViewLink, webContentLink',
      })

      return {
        success: true,
        data: {
          fileId: file.data.id,
          viewLink: file.data.webViewLink,
          downloadLink: file.data.webContentLink,
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
   * Compartilha pasta com cliente
   */
  async shareFolderWithClient(params: {
    folderId: string
    clientEmail: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      await drive.permissions.create({
        auth: this.oauth2Client,
        fileId: params.folderId,
        requestBody: {
          type: 'user',
          role: 'reader',
          emailAddress: params.clientEmail,
        },
      })

      return {
        success: true,
        data: { shared: true },
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

export const googleDriveConnector = new GoogleDriveConnector()
