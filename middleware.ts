import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// @ts-ignore - Ignorar erro de importação, o módulo existe em runtime
import { createServerClient } from '@supabase/ssr'

// Definição manual de tipos para CookieOptions
interface CookieOptions {
  domain?: string
  path?: string
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  maxAge?: number
  httpOnly?: boolean
}

// Rotas públicas que não necessitam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api',
  '/favicon.ico',
]

// Verificar se um caminho deve ser público
const isPublicPath = (path: string) => {
  return publicRoutes.some(route => 
    path === route || 
    path.startsWith('/_next/') || 
    path.startsWith('/static/') ||
    path.startsWith('/api/')
  )
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Não aplicar middleware em recursos estáticos
  if (
    req.nextUrl.pathname.startsWith('/_next/') ||
    req.nextUrl.pathname.startsWith('/static/') ||
    req.nextUrl.pathname.includes('.') // Arquivos com extensão como .css, .js, etc.
  ) {
    return res
  }
  
  try {
    // @ts-ignore - Ignorar erro de tipos, o módulo funciona em runtime
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => req.cookies.get(name)?.value,
          set: (name: string, value: string, options: CookieOptions) => {
            res.cookies.set({ name, value, ...options })
          },
          remove: (name: string, options: CookieOptions) => {
            res.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    const path = req.nextUrl.pathname
    
    // Se é uma página de autenticação e o usuário está autenticado, redirecionar para dashboard
    if ((path === '/login' || path === '/register') && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // Se não é uma rota pública e o usuário não está autenticado, redirecionar para login
    if (!isPublicPath(path) && !session) {
      // Adicionar url atual como parâmetro de redirecionamento
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(redirectUrl)
    }
    
    return res
  } catch (err) {
    console.error('Middleware error:', err)
    
    // Em caso de erro, permitir acesso a rotas públicas e login
    const path = req.nextUrl.pathname
    if (path === '/login' || path === '/register' || isPublicPath(path)) {
      return res
    }
    
    // Para outras rotas, redirecionar para login em caso de erro
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    // Aplicar o middleware a todas as rotas exceto aos recursos estáticos específicos
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 