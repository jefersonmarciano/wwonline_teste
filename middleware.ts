import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Criar cliente Supabase para uso no middleware
const supabaseUrl = 'https://tpiohzdsxmovyxpfzamt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaW9oemRzeG1vdnl4cGZ6YW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQzNDMwMywiZXhwIjoyMDYxMDEwMzAzfQ.DrB2D8EqkUEB7ktaPNfNp8S_jewfzuNO8P01eB9Aa2M'

// Rotas públicas que não necessitam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/register',
]

export async function middleware(request: NextRequest) {
  try {
    // Criar cliente do Supabase para verificação de token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verificar se a rota atual é uma rota pública
    const url = request.nextUrl.clone()
    const path = url.pathname

    if (publicRoutes.includes(path)) {
      return NextResponse.next()
    }

    // Verificar cookie de sessão
    const { data: { session } } = await supabase.auth.getSession()

    // Se não há sessão, redirecionar para login com redirecionamento
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      
      // Adicionar marcação para debug
      console.log(`[Middleware] Redirecionando para login: ${path} -> ${loginUrl.toString()}`)
      
      return NextResponse.redirect(loginUrl)
    }

    // Usuário autenticado, permitir acesso
    return NextResponse.next()
  } catch (error) {
    console.error('[Middleware] Erro:', error)
    
    // Em caso de erro, redirecionar para login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Definir rotas que o middleware deve processar
export const config = {
  matcher: [
    /*
     * Matcher ignorando:
     * - Arquivos (como /favicon.ico, /_next/, /fonts/, etc)
     * - API routes (/api/*)
     */
    '/((?!_next/|_static/|_vercel|favicon.ico|api/).*)',
  ],
} 