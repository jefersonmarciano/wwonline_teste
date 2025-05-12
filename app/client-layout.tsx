"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // Função para verificar se a sessão está travada/corrompida
    const checkSessionStuck = () => {
      const lastAuthCheck = localStorage.getItem('lastAuthCheck')
      const currentTime = new Date().getTime()
      
      // Se estiver carregando por mais de 5 segundos, pode haver um problema
      if (isLoading && lastAuthCheck && (currentTime - parseInt(lastAuthCheck) > 5000)) {
        console.log('Possível problema de sessão detectado, recarregando...')
        localStorage.removeItem('lastAuthCheck')
        window.location.reload()
        return
      }
      
      // Atualizar timestamp de verificação
      localStorage.setItem('lastAuthCheck', currentTime.toString())
    }
    
    // Verificar a cada 2 segundos
    const interval = setInterval(checkSessionStuck, 2000)
    
    // Limpar intervalo ao desmontar
    return () => clearInterval(interval)
  }, [isLoading])
  
  return <>{children}</>
} 