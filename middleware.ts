import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rotas públicas (não precisa autenticação)
const publicRoutes = ['/', '/login', '/register', '/services', '/api/auth/login', '/api/auth/register']

// Rotas que precisam de autenticação
const protectedRoutes = ['/client', '/admin']

// Rotas que só admin pode acessar
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite rotas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/api/services'))) {
    return NextResponse.next()
  }

  // Permite rotas estáticas
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/_next')) {
    return NextResponse.next()
  }

  // Verifica se é rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute || isAdminRoute) {
    // Pega token do cookie ou header
    const token = request.cookies.get('token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // Redireciona para login se não tiver token
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Verifica token
    const payload = verifyToken(token)

    if (!payload) {
      // Token inválido, redireciona para login
      const url = new URL('/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Verifica se é admin route e usuário não é admin
    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/client/dashboard', request.url))
    }

    // Adiciona informações do usuário no header (para APIs)
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-role', payload.role)

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
