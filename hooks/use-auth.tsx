"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { 
  supabase, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut, 
  getCurrentUser,
  isUserAuthenticated,
  getProfile 
} from "@/lib/supabase"

interface User {
  id: string
  email: string
  name: string
  playerId?: string // ID do jogador para convites
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  resetSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateUserProfile: async () => ({ success: false }),
  resetSession: async () => {},
})

// Função para limpar cookies e armazenamento local
const clearAuthData = () => {
  // Limpar cookies manualmente
  document.cookie.split(";").forEach(function(c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Limpar armazenamento local relacionado à autenticação
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('lastAuthCheck');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authRetryCount, setAuthRetryCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Verificar se estamos em uma página pública
  const isPublicPage = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/register' ||
    pathname?.startsWith('/api')
  
  // Verificar parâmetro de limpeza
  const cleanupRequested = searchParams?.get('cleanup') === 'true'

  // Verificar autenticação no carregamento inicial - versão simplificada
  useEffect(() => {
    // Se for solicitada limpeza, limpar dados antes de verificar autenticação
    if (cleanupRequested) {
      console.log("🧹 [Auth] Limpeza de sessão solicitada")
      clearAuthData()
    }
    
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        console.log("🔍 [Auth] Verificando autenticação inicial simplificada...")
        
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("❌ [Auth] Erro ao verificar sessão:", error)
          setIsAuthenticated(false)
          setUser(null)
          return
        }
        
        // Se não há sessão, usuário não está autenticado
        if (!data.session) {
          console.log("🔍 [Auth] Nenhuma sessão encontrada, usuário não autenticado")
          setIsAuthenticated(false)
          setUser(null)
          return
        }
        
        console.log("✅ [Auth] Sessão encontrada, buscando usuário...")
        
        // Sessão existe, buscar detalhes do usuário
        const { user: supabaseUser } = data.session
        
        if (supabaseUser) {
          // Buscar o perfil do usuário
          try {
            const { data: profile, error: profileError } = await getProfile(supabaseUser.id)
            
            if (profileError) {
              console.error("❌ [Auth] Erro ao buscar perfil:", profileError)
              
              // Se erro for de permissão, pode ser um problema com a sessão
              if (profileError.message.includes("permission") && authRetryCount < 2) {
                console.log("🔄 [Auth] Tentando renovar sessão...")
                setAuthRetryCount(prev => prev + 1)
                await resetSession()
                return
              }
            }
            
            if (profile) {
              const userData = {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: profile.name || supabaseUser.email?.split('@')[0] || 'Usuário',
                playerId: profile.player_id
              }
              
              setUser(userData)
              setIsAuthenticated(true)
              console.log("✅ [Auth] Usuário autenticado com sucesso:", userData.email)
            } else if (authRetryCount < 2) {
              // Perfil não encontrado, pode ser um problema com a API
              console.log("🔄 [Auth] Perfil não encontrado, tentando novamente...")
              setAuthRetryCount(prev => prev + 1)
              setTimeout(checkAuth, 1000) // Tentar novamente após um segundo
            }
          } catch (profileError) {
            console.error("❌ [Auth] Erro ao buscar perfil:", profileError)
            
            // Se houver erro de conexão, tentar novamente
            if (authRetryCount < 2) {
              console.log("🔄 [Auth] Tentando novamente buscar perfil...")
              setAuthRetryCount(prev => prev + 1)
              setTimeout(checkAuth, 1500) // Tentar novamente após 1.5 segundos
            }
          }
        }
      } catch (error) {
        console.error("❌ [Auth] Erro ao verificar autenticação:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
    
    // Configurar listener básico para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔍 [Auth] Evento de autenticação:", event)
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: profile } = await getProfile(session.user.id)
            
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.email?.split('@')[0] || 'Usuário',
              playerId: profile?.player_id
            }
            
            setUser(userData)
            setIsAuthenticated(true)
            
            // Navegar para dashboard de forma simples
            if (window.location.pathname === '/login') {
              router.push('/dashboard')
            }
          } catch (error) {
            console.error("❌ [Auth] Erro ao processar login:", error)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAuthenticated(false)
          
          // Navegar para login de forma simples
          if (!isPublicPage) {
            router.push('/login')
          }
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, authRetryCount, isPublicPage, cleanupRequested, pathname, searchParams])

  // Função para reset completo da sessão
  const resetSession = async () => {
    try {
      console.log("🔄 [Auth] Resetando completamente a sessão...")
      
      // Limpar estado
      setUser(null)
      setIsAuthenticated(false)
      
      // Primeiro tentar logout normal
      try {
        await signOut()
      } catch (e) {
        console.error("❌ [Auth] Erro no signOut durante reset:", e)
      }
      
      // Limpar cookies e localStorage
      clearAuthData()
      
      // Recarregar a página para garantir estado limpo
      window.location.href = '/login?cleanup=true'
    } catch (error) {
      console.error("❌ [Auth] Erro ao resetar sessão:", error)
    }
  }

  // Função de login simplificada
  const login = async (email: string, password: string) => {
    try {
      // Limpar estado e cookies antigos antes de tentar fazer login
      clearAuthData()
      
      // Fazer login
      const { data, error } = await signInWithEmail(email, password)
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Email ou senha incorretos. Por favor, verifique suas credenciais." }
        }
        return { success: false, error: error.message }
      }
      
      // Garantir que a sessão esteja armazenada corretamente
      await supabase.auth.getSession()
      
      // Após login bem-sucedido, redirecionar para o dashboard
      if (data.user) {
        router.push('/dashboard')
      }
      
      return { success: true }
    } catch (error) {
      console.error("❌ [Auth] Erro ao fazer login:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido ao fazer login" 
      }
    }
  }

  // Função de registro
  const register = async (email: string, password: string, name: string) => {
    try {
      // Limpar dados antigos primeiro
      clearAuthData()
      
      const { data, error } = await signUpWithEmail(email, password, { name })
      
      if (error) {
        if (error.message.includes("already registered")) {
          return { success: false, error: "Este email já está registrado. Por favor, faça login ou use outro email." }
        }
        return { success: false, error: error.message }
      }
      
      // Criar perfil do usuário com um player_id aleatório
      if (data.user) {
        const playerId = Math.random().toString(36).substring(2, 10).toUpperCase()
        
        await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              name,
              player_id: playerId
            }
          ])
      }
      
      return { success: true }
    } catch (error) {
      console.error("❌ [Auth] Erro ao registrar:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido ao registrar" 
      }
    }
  }

  // Função de logout simplificada
  const logout = async () => {
    try {
      // Limpar estado local primeiro
      setUser(null)
      setIsAuthenticated(false)
      
      // Fazer logout no Supabase
      await signOut()
      
      // Limpar dados de autenticação
      clearAuthData()
      
      // Redirecionar para a página de login
      router.push('/login')
    } catch (error) {
      console.error("❌ [Auth] Erro ao fazer logout:", error)
      
      // Em caso de erro, tentar forçar um logout mais agressivo
      try {
        await supabase.auth.signOut({ scope: 'global' });
        window.location.href = '/login';
      } catch (e) {
        console.error("❌ [Auth] Erro no logout de emergência:", e);
        // Último recurso: recarregar a página para login
        window.location.href = '/login?cleanup=true';
      }
    }
  }

  // Função para atualizar o perfil do usuário
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user?.id) {
      return { success: false, error: "Usuário não autenticado" }
    }

    try {
      const supabaseUpdates: any = {}
      
      if (updates.name) supabaseUpdates.name = updates.name
      if (updates.playerId) supabaseUpdates.player_id = updates.playerId
      
      const { error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', user.id)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      // Atualizar o estado local
      setUser(prevUser => {
        if (!prevUser) return null
        return { ...prevUser, ...updates }
      })
      
      return { success: true }
    } catch (error) {
      console.error("❌ [Auth] Erro ao atualizar perfil:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido ao atualizar perfil" 
      }
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading,
        login, 
        register,
        logout,
        updateUserProfile,
        resetSession
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
