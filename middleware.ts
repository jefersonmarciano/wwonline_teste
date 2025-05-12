import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

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
    const supabase = createMiddlewareClient({ req, res })
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