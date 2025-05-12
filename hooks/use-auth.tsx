"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
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

  // Verificar autenticação no carregamento inicial
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const authenticated = await isUserAuthenticated()
        
        if (authenticated) {
          const supabaseUser = await getCurrentUser()
          
          if (supabaseUser) {
            // Buscar o perfil do usuário
            const { data: profile, error } = await getProfile(supabaseUser.id)
            
            if (profile) {
              setUser({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: profile.name || supabaseUser.email?.split('@')[0] || 'Usuário',
                playerId: profile.player_id
              })
              setIsAuthenticated(true)
            }
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Usuário acabou de fazer login
          const { data: profile } = await getProfile(session.user.id)
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || session.user.email?.split('@')[0] || 'Usuário',
            playerId: profile?.player_id
          })
          setIsAuthenticated(true)
        } else if (event === 'SIGNED_OUT') {
          // Usuário acabou de fazer logout
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    )

    return () => {
      // Remover listener ao desmontar
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await signInWithEmail(email, password)
      
      if (error) {
        // Mensagem mais amigável para erro de credenciais inválidas
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Email ou senha incorretos. Por favor, verifique suas credenciais." }
        }
        return { success: false, error: error.message }
      }
      
      // Se o login for bem-sucedido, o listener vai atualizar o estado
      return { success: true }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido ao fazer login" 
      }
    }
  }

  // Função de registro
  const register = async (email: string, password: string, name: string) => {
    try {
      // Registrar o usuário
      const { data, error } = await signUpWithEmail(email, password, { name })
      
      if (error) {
        // Mensagem mais amigável para erro de usuário já registrado
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
      console.error("Erro ao registrar:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido ao registrar" 
      }
    }
  }

  // Função de logout
  const logout = async () => {
    try {
      await signOut()
      // O listener vai atualizar o estado
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
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
      console.error("Erro ao atualizar perfil:", error)
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
