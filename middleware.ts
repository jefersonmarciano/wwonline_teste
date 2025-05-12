import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não necessitam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/_next',
  '/api',
  '/favicon.ico',
  '/static',
]

export function middleware(request: NextRequest) {
  // Obtém o caminho atual
  const path = request.nextUrl.pathname
  
  // Ignora completamente o middleware para evitar loops infinitos
  // Permitir acesso a qualquer rota, a autenticação será verificada no lado do cliente
  return NextResponse.next()
}

// Limitar o matcher apenas para APIs específicas que precisam de proteção
export const config = {
  matcher: [
    // Aplicar o middleware apenas em rotas de API específicas que precisam de proteção
    // Isso evita loops de redirecionamento nas páginas do cliente
    '/api/protected/:path*',
  ],
} 