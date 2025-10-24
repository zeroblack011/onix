/**
 * CONECTOR HUGGING FACE - IA e Recomendações
 * Análise de perfil, recomendações personalizadas e otimização
 */

import { HfInference } from '@huggingface/inference'
import type { ConnectorResult, AIRecommendation } from '@/types'

export class HuggingFaceConnector {
  private hf: HfInference

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY!)
  }

  /**
   * Analisa perfil do cliente e gera recomendações
   */
  async generateRecommendations(params: {
    userId: string
    currentServices: string[]
    businessType?: string
    goals?: string[]
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const prompt = `
Você é um assistente especializado em negócios digitais.
Analise o perfil do cliente e recomende serviços relevantes:

Serviços atuais: ${params.currentServices.join(', ')}
Tipo de negócio: ${params.businessType || 'Não informado'}
Objetivos: ${params.goals?.join(', ') || 'Não informado'}

Serviços disponíveis:
- LLC EUA Completa (R$ 2.997)
- TikTok Shop BR/US/UK (R$ 497-997)
- Proxies Globais (R$ 37-77/mês)
- Fabricante White-Label (R$ 97)
- IA Anúncios (R$ 147/mês)
- Apps Personalizados (R$ 4.997)
- Business Managers (R$ 300-450)
- Site E-commerce (R$ 1.997)

Forneça 3 recomendações no formato JSON:
{
  "recommendations": [
    {
      "serviceId": "id",
      "reason": "motivo",
      "confidence": 0.9,
      "potentialSavings": 500
    }
  ]
}
`

      const response = await this.hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      })

      // Parse JSON response
      const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response')
      }

      const data = JSON.parse(jsonMatch[0])

      return {
        success: true,
        data: data.recommendations,
        executionTime: Date.now() - startTime,
      }
    } catch (error: any) {
      // Fallback para recomendações básicas
      return {
        success: true,
        data: this.getFallbackRecommendations(params),
        executionTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Otimiza texto de anúncio
   */
  async optimizeAdCopy(params: {
    originalText: string
    platform: string
    tone?: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const prompt = `
Otimize este texto de anúncio para ${params.platform}:

Texto original: "${params.originalText}"
Tom desejado: ${params.tone || 'persuasivo e profissional'}

Forneça 3 variações otimizadas que sejam:
- Atrativas e convincentes
- Adequadas para ${params.platform}
- Dentro do limite de caracteres

Formato JSON:
{
  "variations": ["variação 1", "variação 2", "variação 3"]
}
`

      const response = await this.hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.8,
          return_full_text: false,
        },
      })

      const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response')
      }

      const data = JSON.parse(jsonMatch[0])

      return {
        success: true,
        data: data.variations,
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
   * Analisa sentimento de texto (feedback, review)
   */
  async analyzeSentiment(params: {
    text: string
  }): Promise<ConnectorResult> {
    const startTime = Date.now()

    try {
      const response = await this.hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: params.text,
      })

      return {
        success: true,
        data: {
          sentiment: response[0].label,
          confidence: response[0].score,
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
   * Recomendações de fallback (caso IA falhe)
   */
  private getFallbackRecommendations(params: {
    currentServices: string[]
    businessType?: string
  }): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []

    // Se tem TikTok Shop, recomenda IA Anúncios
    if (params.currentServices.some(s => s.includes('tiktok'))) {
      recommendations.push({
        serviceId: 'ia-anuncios',
        serviceName: 'IA Anúncios',
        reason: 'Otimize suas vendas com campanhas automáticas',
        confidence: 0.85,
        potentialSavings: 300,
      })
    }

    // Se tem e-commerce, recomenda proxies
    if (params.currentServices.some(s => s.includes('ecommerce'))) {
      recommendations.push({
        serviceId: 'proxy-brasil',
        serviceName: 'Proxy Brasil',
        reason: 'Gestão segura de múltiplas contas',
        confidence: 0.75,
      })
    }

    // Sempre recomenda LLC para negócios sérios
    if (!params.currentServices.includes('llc')) {
      recommendations.push({
        serviceId: 'llc-usa-complete',
        serviceName: 'LLC EUA Completa',
        reason: 'Estruture seu negócio internacionalmente',
        confidence: 0.90,
        potentialSavings: 5000,
      })
    }

    return recommendations.slice(0, 3)
  }
}

export const huggingfaceConnector = new HuggingFaceConnector()
