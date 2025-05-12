"use client"

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wuthering Waves Pick & Ban",
  description: "Sistema de pick e ban para o jogo Wuthering Waves",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
  
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
