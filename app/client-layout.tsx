"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sessionError, setSessionError] = useState<boolean>(false)
  const [checkingSession, setCheckingSession] = useState<boolean>(false)
  
  // Determinar se estamos em uma página pública
  const isPublicPage = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/register' ||
    pathname.startsWith('/api')
  
  useEffect(() => {
    // Função para verificar se a sessão está travada/corrompida
    const checkSessionStuck = () => {
      // Ignorar verificação em páginas públicas
      if (isPublicPage) return
      
      const lastAuthCheck = localStorage.getItem('lastAuthCheck')
      const currentTime = new Date().getTime()
      
      // Se não estiver carregando, atualizar timestamp de verificação
      if (!isLoading) {
        localStorage.setItem('lastAuthCheck', currentTime.toString())
        return
      }
      
      // Se estiver carregando por mais de 5 segundos, pode haver um problema
      if (isLoading && lastAuthCheck && (currentTime - parseInt(lastAuthCheck) > 5000)) {
        console.log('Possível problema de sessão detectado')
        setSessionError(true)
        return
      }
    }
    
    // Verificar a cada 2 segundos
    const interval = setInterval(checkSessionStuck, 2000)
    
    // Limpar intervalo ao desmontar
    return () => clearInterval(interval)
  }, [isLoading, isPublicPage])
  
  // Função para limpar a sessão e cookies
  const clearSessionAndReload = async () => {
    setCheckingSession(true)
    
    try {
      // Primeiro tentar logout normal
      await logout()
      
      // Limpar localStorage
      localStorage.clear()
      
      // Limpar cookies manualmente
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Redirecionar para login com parâmetro de cleanup
      window.location.href = "/login?cleanup=true"
    } catch (error) {
      console.error("Erro ao limpar sessão:", error)
      
      // Em caso de erro, tentar redirecionar para login
      window.location.href = "/login?cleanup=true"
    }
  }
  
  // Mostrar alerta de erro de sessão se detectado
  if (sessionError && !isPublicPage) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema detectado na sessão</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Detectamos que sua sessão pode estar travada ou corrompida.</p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4">
              {checkingSession ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Limpando sessão...</span>
                </div>
              ) : (
                <>
                  <Button onClick={clearSessionAndReload} variant="destructive">
                    Limpar Sessão e Recarregar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Apenas Recarregar
                  </Button>
                </>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return <>{children}</>
} 