"use client"

import { useState, FormEvent, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { KeyRound, AlertCircle, Loader2, QrCode } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layouts/main-layout"

// Componente interno que usa useSearchParams
function JoinDraftForm() {
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQrMessage, setShowQrMessage] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Verificar se há um código na URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      setInviteCode(codeFromUrl)
      // Se houver um código, submeter automaticamente após a autenticação
      if (isAuthenticated && !authLoading) {
        handleJoinWithCode(codeFromUrl)
      }
    }
  }, [searchParams, isAuthenticated, authLoading])

  const handleJoinWithCode = async (code: string) => {
    if (!code) {
      setError("Por favor, insira o código de convite")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Buscar a sala de draft usando o código de convite
      const { data, error } = await supabase
        .from('draft_details')
        .select('draft_id')
        .eq('invite_code', code.toUpperCase())
        .single()

      if (error || !data) {
        setError("Código de convite inválido. Verifique o código e tente novamente.")
        return
      }

      // Redirecionar para a sala de draft
      router.push(`/draft/room/${data.draft_id}`)
    } catch (err) {
      console.error("Erro ao entrar na sala:", err)
      setError(err instanceof Error ? err.message : "Erro ao entrar na sala de draft")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await handleJoinWithCode(inviteCode)
  }
  
  const handleScanQrCode = () => {
    setShowQrMessage(true)
    setTimeout(() => setShowQrMessage(false), 3000)
  }

  // Verificar autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preservar o código na URL quando redirecionar para login
    const code = searchParams.get('code')
    const redirectUrl = code 
      ? `/login?redirect=${encodeURIComponent(`/draft/join?code=${code}`)}`
      : "/login?redirect=/draft/join"
    router.push(redirectUrl)
    return null
  }

  return (
    <div className="container mx-auto flex justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Entrar em uma Sala</CardTitle>
          <CardDescription>Use um código de convite para entrar em uma sala de draft</CardDescription>
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
            
            {showQrMessage && (
              <Alert className="bg-blue-600 text-white border-blue-700">
                <QrCode className="h-4 w-4" />
                <AlertTitle>Em breve!</AlertTitle>
                <AlertDescription>
                  A funcionalidade de escaneamento de QR Code estará disponível em uma próxima atualização.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="inviteCode">Código de Convite</Label>
              <div className="flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <Input
                  id="inviteCode"
                  placeholder="ABCDEF"
                  className="uppercase"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                O código de convite é um código de 6 letras fornecido pelo criador da sala.
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleScanQrCode}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                <span>Escanear QR Code</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar na Sala"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push("/draft/create")}
            >
              Criar nova sala
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// Componente principal com Suspense
export default function JoinDraftPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="text-center py-8"><Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />Carregando...</div>}>
        <JoinDraftForm />
      </Suspense>
    </MainLayout>
  )
} 