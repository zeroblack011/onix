import Link from 'next/link'
import { SERVICES_CATALOG, CREDIT_PACKAGES, SERVICE_CATEGORIES } from '@/constants/services'

export default function HomePage() {
  const popularServices = SERVICES_CATALOG.filter(s => s.popular)
  const featuredPackage = CREDIT_PACKAGES.find(p => p.popular)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">Global Business</h1>
                <p className="text-xs text-gray-600">Automation Suite</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#services" className="text-gray-700 hover:text-primary-600 transition">
                Serviços
              </Link>
              <Link href="#credits" className="text-gray-700 hover:text-primary-600 transition">
                Créditos
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-primary-600 transition">
                Como Funciona
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <Link
                href="/client/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >
                Login
              </Link>
              <Link
                href="/client/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistema Definitivo de
            <span className="text-primary-500"> Automação Empresarial</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa com 17+ serviços premium que combina IA + Automação +
            Qualidade Humana para acelerar seu negócio digital globalmente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#services"
              className="px-8 py-4 text-lg font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition shadow-lg hover:shadow-xl"
            >
              Ver Todos os Serviços
            </Link>
            <Link
              href="#credits"
              className="px-8 py-4 text-lg font-semibold text-primary-600 bg-white border-2 border-primary-500 rounded-xl hover:bg-primary-50 transition"
            >
              Economize com Créditos
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary-600">17+</div>
              <div className="text-gray-600">Serviços Premium</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600">10+</div>
              <div className="text-gray-600">Conectores IA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600">24/7</div>
              <div className="text-gray-600">Suporte Ativo</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600">70%</div>
              <div className="text-gray-600">Mais Rápido</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-4">Serviços Mais Populares</h3>
          <p className="text-center text-gray-600 mb-12">
            Escolha entre nossos serviços mais requisitados
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-primary-500 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    Popular
                  </span>
                </div>

                <h4 className="text-xl font-bold mb-2">{service.name}</h4>
                <p className="text-gray-600 text-sm mb-4 min-h-[60px]">
                  {service.description}
                </p>

                <div className="space-y-2 mb-6">
                  {service.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold text-primary-600">
                      R$ {service.price.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ou {service.credits} créditos
                    </div>
                  </div>
                  <Link
                    href={`/services/${service.slug}`}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                  >
                    Contratar
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center px-6 py-3 text-primary-600 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition font-medium"
            >
              Ver Todos os 17 Serviços
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Credit Packages */}
      <section id="credits" className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-4">
            Economize com Nosso Sistema de Créditos
          </h3>
          <p className="text-center text-gray-600 mb-12">
            Compre créditos e economize até 100% em seus serviços
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl p-6 border-2 ${
                  pkg.popular
                    ? 'border-primary-500 shadow-xl scale-105'
                    : 'border-gray-200'
                } transition hover:shadow-lg`}
              >
                {pkg.popular && (
                  <span className="block text-center px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full mb-4">
                    Mais Popular
                  </span>
                )}

                <h4 className="text-2xl font-bold text-center mb-2">{pkg.name}</h4>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary-600">
                    R$ {pkg.price.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">{pkg.credits} créditos</div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {pkg.discount}%
                    </div>
                    <div className="text-xs text-green-700">de desconto</div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 mb-4">
                  <div>Preço efetivo:</div>
                  <div className="font-semibold">R$ {pkg.effectivePrice.toFixed(2)}/crédito</div>
                </div>

                <div className="text-center text-xs text-gray-500 mb-6">
                  Ideal para: {pkg.bestFor}
                </div>

                <Link
                  href="/client/dashboard?action=buy-credits"
                  className={`block w-full py-3 text-center rounded-lg font-medium transition ${
                    pkg.popular
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Comprar Agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">Como Funciona</h3>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Escolha o Serviço</h4>
              <p className="text-gray-600">
                Navegue por nosso catálogo completo de 17+ serviços premium e escolha o que precisa.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Pague e Relaxe</h4>
              <p className="text-gray-600">
                Pague com PIX, cartão ou use seus créditos. Sistema 100% seguro e automatizado.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Receba Rapidamente</h4>
              <p className="text-gray-600">
                Nossa IA + equipe processam seu pedido. Acompanhe tudo em tempo real no painel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-4">
            Pronto para Acelerar Seu Negócio?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de empreendedores que já automatizaram seus negócios
          </p>
          <Link
            href="/client/dashboard"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition text-lg shadow-xl"
          >
            Começar Agora Gratuitamente
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-bold mb-4">Global Business</h5>
              <p className="text-gray-400 text-sm">
                Plataforma completa de automação empresarial com IA e qualidade humana.
              </p>
            </div>

            <div>
              <h5 className="font-bold mb-4">Serviços</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>LLC EUA</li>
                <li>TikTok Shops</li>
                <li>Proxies Globais</li>
                <li>Marketing IA</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4">Empresa</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Sobre Nós</li>
                <li>Como Funciona</li>
                <li>Suporte 24/7</li>
                <li>Contato</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Termos de Uso</li>
                <li>Privacidade</li>
                <li>LGPD</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 Global Business Automation Suite. Todos os direitos reservados.</p>
            <p className="mt-2">Desenvolvido com ❤️ usando Claude AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
