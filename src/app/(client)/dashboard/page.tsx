/**
 * PAINEL DO CLIENTE
 * Dashboard completo com overview, serviços, recomendações e suporte
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ClientDashboard() {
  const [credits] = useState(1250)
  const [activeServices] = useState(3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Painel do Cliente</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Créditos Disponíveis</div>
                <div className="text-2xl font-bold text-primary-600">{credits}</div>
              </div>
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Visão Geral */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-3xl font-bold text-primary-600">{credits}</div>
            <div className="text-sm text-gray-600">Créditos Disponíveis</div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
            <div className="text-3xl mb-2">🛍️</div>
            <div className="text-3xl font-bold text-green-600">{activeServices}</div>
            <div className="text-sm text-gray-600">Serviços Ativos</div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold text-orange-600">2</div>
            <div className="text-sm text-gray-600">Próximas Renovações</div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-purple-600">Premium</div>
            <div className="text-sm text-gray-600">Nível Cliente</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Meus Serviços */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold mb-4">🎯 Meus Serviços</h2>

              <div className="space-y-4">
                {/* Serviço 1 */}
                <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">TikTok Shop US</h3>
                    <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                      ✅ ATIVO
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    📈 Performance: 92%
                  </div>
                  <Link
                    href="/client/services/tiktok-shop-us"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Ver Detalhes →
                  </Link>
                </div>

                {/* Serviço 2 */}
                <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Proxy USA</h3>
                    <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                      ✅ ATIVO
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    ⏰ Renova em: 15 dias
                  </div>
                  <Link
                    href="/client/services/proxy-usa"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Ver Detalhes →
                  </Link>
                </div>

                {/* Serviço 3 */}
                <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">IA Anúncios</h3>
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-full">
                      ⚡ CONFIGURANDO
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    ⏳ Tempo restante: 2h
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>

              <Link
                href="/services"
                className="mt-6 block w-full py-3 text-center bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
              >
                + Adicionar Novo Serviço
              </Link>
            </div>

            {/* Pedidos Recentes */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold mb-4">📦 Pedidos Recentes</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">#ORD-8472</div>
                    <div className="text-sm text-gray-600">TikTok Shop US</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-medium text-sm">✅ Concluído</div>
                    <div className="text-xs text-gray-500">2 dias atrás</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">#ORD-8471</div>
                    <div className="text-sm text-gray-600">Proxy USA</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-medium text-sm">🔄 Processando</div>
                    <div className="text-xs text-gray-500">1 hora atrás</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recomendações IA */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">💡 Recomendações IA</h2>

              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <h3 className="font-bold mb-1">🔥 TikTok Shop BR</h3>
                  <p className="text-sm opacity-90 mb-2">
                    Expanda para o mercado brasileiro
                  </p>
                  <div className="text-sm font-medium">497 créditos</div>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <h3 className="font-bold mb-1">🌐 Site E-commerce</h3>
                  <p className="text-sm opacity-90 mb-2">
                    Complemente suas vendas
                  </p>
                  <div className="text-sm font-medium">1.997 créditos</div>
                </div>
              </div>

              <button className="mt-4 w-full py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition">
                Ver Todas
              </button>
            </div>

            {/* Suporte */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold mb-4">📞 Suporte Rápido</h2>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💬</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">Chat Intercom</div>
                      <div className="text-xs text-gray-600">Online agora</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📞</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">WhatsApp</div>
                      <div className="text-xs text-gray-600">15min resposta</div>
                    </div>
                  </div>
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📧</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">Email</div>
                      <div className="text-xs text-gray-600">2h resposta</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Comprar Créditos */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-2">💰 Comprar Créditos</h2>
              <p className="text-sm opacity-90 mb-4">
                Economize até 100% com nossos pacotes
              </p>
              <button className="w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition">
                Ver Pacotes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
