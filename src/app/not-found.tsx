export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-primary-500 mb-4">404</div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Página não encontrada
        </h2>

        <p className="text-gray-600 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex gap-3 justify-center">
          <a
            href="/"
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Voltar ao Início
          </a>

          <a
            href="/services"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Ver Serviços
          </a>
        </div>
      </div>
    </div>
  )
}
