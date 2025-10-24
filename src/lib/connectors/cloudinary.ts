/**
 * CONECTOR CLOUDINARY - Upload e Otimização de Imagens
 */

import { v2 as cloudinary } from 'cloudinary'
import type { ConnectorResult } from '@/types'

export class CloudinaryConnector {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    })
  }

  /**
   * Upload de arquivo
   */
  async uploadFile(params: {
    fileBuffer: Buffer
    fileName: string
    folder?: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const base64 = `data:image/png;base64,${params.fileBuffer.toString('base64')}`

      const result = await cloudinary.uploader.upload(base64, {
        folder: params.folder || 'uploads',
        public_id: params.fileName,
        resource_type: 'auto',
      })

      return {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
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
   * Deleta arquivo
   */
  async deleteFile(publicId: string): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      await cloudinary.uploader.destroy(publicId)

      return {
        success: true,
        data: { deleted: true },
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

export const cloudinaryConnector = new CloudinaryConnector()
