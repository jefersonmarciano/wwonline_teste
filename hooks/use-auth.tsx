"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateUserProfile: async () => ({ success: false }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar autenticação no carregamento inicial - versão simplificada
  useEffect(() => {
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
            }
          } catch (profileError) {
            console.error("❌ [Auth] Erro ao buscar perfil:", profileError)
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
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            router.push('/login')
          }
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  // Função de login simplificada
  const login = async (email: string, password: string) => {
    try {
      // Limpar estado e cookies antigos antes de tentar fazer login
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('lastAuthCheck');
      
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
      
      // Limpar cookies manualmente para garantir limpeza completa
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Limpar qualquer armazenamento local relacionado à autenticação
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('lastAuthCheck');
      
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
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
