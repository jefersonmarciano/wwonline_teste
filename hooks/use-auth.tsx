"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
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
  if (typeof document !== "undefined") {
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Limpar armazenamento local relacionado à autenticação
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('lastAuthCheck');
    sessionStorage.removeItem('supabase.auth.token');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
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

  // Função para verificar autenticação - extraída para poder ser chamada manualmente também
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("🔍 [Auth] Verificando autenticação...")
      
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("❌ [Auth] Erro ao verificar sessão:", error)
        setIsAuthenticated(false)
        setUser(null)
        setAuthChecked(true)
        return
      }
      
      // Se não há sessão, usuário não está autenticado
      if (!data.session) {
        console.log("🔍 [Auth] Nenhuma sessão encontrada, usuário não autenticado")
        setIsAuthenticated(false)
        setUser(null)
        setAuthChecked(true)
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
          } else {
            // Se não houver perfil, verificar se podemos criar um
            console.log("⚠️ [Auth] Perfil não encontrado, tentando criar...")
            const { data: newProfile, error: createError } = await supabase.from('profiles').insert({
              id: supabaseUser.id,
              name: supabaseUser.email?.split('@')[0] || 'Usuário',
              email: supabaseUser.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }).select().single()
            
            if (createError) {
              console.error("❌ [Auth] Erro ao criar perfil:", createError)
            } else if (newProfile) {
              const userData = {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: newProfile.name || 'Usuário',
                playerId: newProfile.player_id
              }
              
              setUser(userData)
              setIsAuthenticated(true)
              console.log("✅ [Auth] Perfil criado e usuário autenticado:", userData.email)
            }
          }
        } catch (profileError) {
          console.error("❌ [Auth] Erro ao buscar perfil:", profileError)
        }
      }
    } catch (error) {
      console.error("❌ [Auth] Erro ao verificar autenticação:", error)
    } finally {
      setIsLoading(false)
      setAuthChecked(true)
    }
  }, [])

  // Verificar autenticação no carregamento inicial
  useEffect(() => {
    // Se for solicitada limpeza, limpar dados antes de verificar autenticação
    if (cleanupRequested) {
      console.log("🧹 [Auth] Limpeza de sessão solicitada")
      clearAuthData()
    }
    
    // Executar verificação de autenticação
    checkAuth()
    
    // Configurar listener para mudanças de autenticação
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
            
            // Redireção após login bem-sucedido
            // Usar timeout para garantir que a mudança de estado seja processada
            setTimeout(() => {
              const redirectTo = searchParams?.get('redirect') || '/dashboard'
              console.log("🔄 [Auth] Redirecionando após login para:", redirectTo)
              
              // Usar window.location para navegação mais forte
              // em vez de router.push que às vezes falha por conta de estado
              window.location.href = redirectTo
            }, 500)
          } catch (error) {
            console.error("❌ [Auth] Erro ao processar login:", error)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAuthenticated(false)
          
          // Navegar para login se não estamos em uma página pública
          if (!isPublicPage) {
            console.log("🔄 [Auth] Redirecionando para login após logout")
            // Usar router.push para navegação após logout
            router.push('/login')
          }
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, isPublicPage, cleanupRequested, pathname, searchParams, checkAuth])

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

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      console.log("🔑 [Auth] Tentando fazer login:", email)
      
      // Limpar estado e cookies antigos antes de tentar fazer login
      clearAuthData()
      
      // Fazer login
      const { data, error } = await signInWithEmail(email, password)
      
      if (error) {
        console.error("❌ [Auth] Erro de login:", error.message)
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Email ou senha incorretos. Por favor, verifique suas credenciais." }
        }
        
        if (error.message.includes("cors") || error.message.includes("CORS")) {
          return { success: false, error: "Erro de CORS detectado. Isso pode ser causado por bloqueio no navegador ou configurações de rede." }
        }
        
        return { success: false, error: error.message }
      }
      
      // Se chegou aqui, login foi bem-sucedido
      console.log("✅ [Auth] Login bem-sucedido:", data.user?.email)
      
      // Não precisamos setar aqui o usuário, pois o evento onAuthStateChange vai cuidar disso
      // e também fazer o redirecionamento
      
      return { success: true }
    } catch (error: any) {
      console.error("❌ [Auth] Erro inesperado no login:", error)
      return { 
        success: false, 
        error: error.message || "Erro desconhecido ao fazer login. Tente novamente mais tarde."
      }
    }
  }

  // Função para registrar novo usuário
  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("🔑 [Auth] Registrando novo usuário:", email)
      
      // Limpar dados antigos
      clearAuthData()
      
      // Dados adicionais para o perfil
      const metadata = {
        name,
      }
      
      // Registrar usuário
      const { data, error } = await signUpWithEmail(email, password, metadata)
      
      if (error) {
        console.error("❌ [Auth] Erro ao registrar:", error.message)
        if (error.message.includes("already registered")) {
          return { success: false, error: "Este email já está registrado. Tente fazer login ou recuperar sua senha." }
        }
        return { success: false, error: error.message }
      }
      
      console.log("✅ [Auth] Registro bem-sucedido:", data.user?.email)
      
      // Em caso de sucesso, fazer login automaticamente
      return await login(email, password)
    } catch (error: any) {
      console.error("❌ [Auth] Erro inesperado no registro:", error)
      return { 
        success: false, 
        error: error.message || "Erro desconhecido ao registrar. Tente novamente mais tarde."
      }
    }
  }

  // Função para logout
  const logout = async () => {
    console.log("🔑 [Auth] Fazendo logout")
    try {
      await signOut()
      clearAuthData()
      setUser(null)
      setIsAuthenticated(false)
      
      // Navegar para página de login
      router.push('/login')
    } catch (error) {
      console.error("❌ [Auth] Erro ao fazer logout:", error)
      
      // Mesmo com erro, limpar dados locais
      clearAuthData()
      setUser(null)
      setIsAuthenticated(false)
      
      // Forçar navegação para login
      window.location.href = '/login'
    }
  }

  // Função para atualizar perfil
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }
    
    try {
      console.log("📝 [Auth] Atualizando perfil do usuário:", user.id)
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) {
        console.error("❌ [Auth] Erro ao atualizar perfil:", error)
        return { success: false, error: error.message }
      }
      
      // Atualizar estado local
      setUser({ ...user, ...updates })
      
      return { success: true }
    } catch (error: any) {
      console.error("❌ [Auth] Erro inesperado ao atualizar perfil:", error)
      return { 
        success: false, 
        error: error.message || "Erro desconhecido ao atualizar perfil."
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
