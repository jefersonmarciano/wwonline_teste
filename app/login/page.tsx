"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { signInForTesting } from "@/lib/supabase"

// Componente interno que usa useSearchParams
function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Usuário já autenticado, redirecionando para dashboard")
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Verificar se o usuário foi redirecionado após o registro
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Conta criada com sucesso! Faça login para continuar.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      // Usar a função login do hook useAuth
      const result = await login(email, password)
      
      if (result.success) {
        setSuccess("Login realizado com sucesso! Redirecionando...")
        // Não é necessário redirecionar aqui, o hook useAuth já cuida disso
      } else {
        setError(result.error || "Erro ao fazer login")
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para fazer login com a conta de teste
  const handleTestLogin = async () => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const response = await signInForTesting()
      
      if (response.error) {
        setError("Erro ao fazer login de teste: " + response.error.message)
      } else {
        setSuccess("Login de teste realizado com sucesso! Redirecionando...")
        // O redirecionamento será feito pelo listener de autenticação
      }
    } catch (error) {
      console.error("Erro ao fazer login de teste:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido ao fazer login de teste")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Entre com sua conta para acessar o sistema de pick e ban</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-700 text-white border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full mt-2" 
            onClick={handleTestLogin}
            disabled={isLoading}
          >
            Entrar para teste (sem cadastro)
          </Button>
          
          <div className="text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Registre-se
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

// Componente principal que envolve LoginForm em um Suspense boundary
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
