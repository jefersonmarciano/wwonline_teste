"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cleaningSession, setCleaningSession] = useState(false)
  const [attemptedRedirect, setAttemptedRedirect] = useState(false)
  const { login, isAuthenticated, isLoading, resetSession } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const cleanupRequested = searchParams?.get('cleanup') === 'true'
  const redirectTo = searchParams?.get('redirect') || '/dashboard'

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (isAuthenticated && !attemptedRedirect) {
      console.log("Usuário já autenticado, redirecionando para", redirectTo)
      setAttemptedRedirect(true) // Evitar múltiplas tentativas
      
      // Usar timeout para garantir que o estado seja atualizado antes do redirecionamento
      setTimeout(() => {
        router.push(redirectTo)
      }, 100)
    }
  }, [isAuthenticated, router, redirectTo, attemptedRedirect])

  // Adicionar código para limpar cookies corrompidos ao entrar na página
  useEffect(() => {
    if (cleanupRequested) {
      console.log("Executando limpeza de sessão...")
      setCleaningSession(true)
      
      // Limpar cookies manualmente
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Limpar localStorage relacionado à autenticação
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('lastAuthCheck');
      sessionStorage.removeItem('supabase.auth.token');
      
      setTimeout(() => {
        setCleaningSession(false)
        setSuccess("Sessão limpa com sucesso. Você pode tentar fazer login novamente.")
        
        // Remover o parâmetro de limpeza da URL para evitar limpezas repetidas
        if (typeof window !== 'undefined') {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('cleanup');
          window.history.replaceState({}, '', newUrl.href);
        }
      }, 1500)
    }
  }, [cleanupRequested])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const { success, error } = await login(email, password)
      
      if (!success && error) {
        setError(error)
        return
      }
      
      setSuccess("Login realizado com sucesso! Redirecionando...")
      
      // Garantir que o redirecionamento aconteça mesmo se o evento de auth não disparar
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo
        }
      }, 1500)
      
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      setError("Erro inesperado ao fazer login. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleCleanSession = async () => {
    try {
      setCleaningSession(true)
      setError(null)
      
      await resetSession()
      
      setSuccess("Sessão limpa com sucesso. Você pode tentar fazer login novamente.")
    } catch (error) {
      console.error("Erro ao limpar sessão:", error)
      setError("Erro ao limpar sessão")
    } finally {
      setCleaningSession(false)
    }
  }

  const handleTestLogin = () => {
    setEmail("teste@example.com")
    setPassword("Teste@123")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre com sua conta para acessar o sistema de pick e ban
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <Alert className="bg-green-900/20 border-green-900">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {cleaningSession && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>Limpando sessão...</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || isLoading || cleaningSession}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || isLoading || cleaningSession}
              />
            </div>
            <Button 
              className="w-full" 
              type="submit"
              disabled={loading || isLoading || cleaningSession}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : "Entrar"}
            </Button>
          </form>

          <Button 
            variant="outline"
            className="w-full" 
            onClick={handleTestLogin}
            disabled={loading || isLoading || cleaningSession}
          >
            Entrar para teste (sem cadastro)
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex justify-between w-full">
            <Link href="/register" className="text-sm text-muted-foreground hover:text-primary">
              Não tem uma conta? Registre-se
            </Link>
            <button 
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={handleCleanSession}
              disabled={cleaningSession}
            >
              {cleaningSession ? (
                <span className="flex items-center">
                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  Limpando...
                </span>
              ) : "Problemas para entrar? Limpar sessão"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
