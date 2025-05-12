"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [lastDrafts, setLastDrafts] = useState<any[]>([])
  const [isDbChecking, setIsDbChecking] = useState(true)
  const [dbStatus, setDbStatus] = useState<{
    friends: boolean;
    friendRequests: boolean;
    notifications: boolean;
  }>({
    friends: false,
    friendRequests: false,
    notifications: false
  })
  const router = useRouter()

  // Verificar status do banco de dados
  useEffect(() => {
    const checkDatabaseStructure = async () => {
      if (!isAuthenticated) return

      setIsDbChecking(true)
      
      try {
        // Verificar tabela friends
        const { data: friendsData, error: friendsError } = await supabase
          .from('friends')
          .select('id')
          .limit(1)
        
        // Verificar tabela friend_requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('friend_requests')
          .select('id')
          .limit(1)
        
        // Verificar tabela notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('id')
          .limit(1)
        
        setDbStatus({
          friends: !friendsError,
          friendRequests: !requestsError,
          notifications: !notificationsError
        })
      } catch (error) {
        console.error("Erro ao verificar estrutura do banco de dados:", error)
      } finally {
        setIsDbChecking(false)
      }
    }
    
    checkDatabaseStructure()
  }, [isAuthenticated])

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Carregar últimos drafts do usuário
  useEffect(() => {
    const loadLastDrafts = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('drafts')
          .select('*')
          .or(`player1->>id.eq.${user.id},player2->>id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(3)

        if (!error && data) {
          setLastDrafts(data)
        }
      } catch (error) {
        console.error("Erro ao carregar drafts:", error)
      }
    }

    loadLastDrafts()
  }, [user])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {isDbChecking ? (
        <Alert className="mb-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Verificando estrutura do banco de dados...</AlertTitle>
          <AlertDescription>
            Estamos verificando se as tabelas necessárias estão configuradas corretamente.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {(!dbStatus.friends || !dbStatus.friendRequests || !dbStatus.notifications) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Problema na estrutura do banco de dados</AlertTitle>
              <AlertDescription>
                <p>Detectamos problemas na estrutura do banco de dados que podem causar erros no aplicativo:</p>
                <ul className="list-disc list-inside mt-2">
                  {!dbStatus.friends && <li>Tabela de amigos (friends)</li>}
                  {!dbStatus.friendRequests && <li>Tabela de solicitações de amizade (friend_requests)</li>}
                  {!dbStatus.notifications && <li>Tabela de notificações (notifications)</li>}
                </ul>
                <div className="mt-4">
                  <p className="font-medium">Para corrigir este problema:</p>
                  <ol className="list-decimal list-inside mt-1">
                    <li>Acesse o painel de controle do seu projeto Supabase</li>
                    <li>Navegue até a seção "SQL Editor"</li>
                    <li>Cole e execute o conteúdo do arquivo <code className="bg-gray-800 px-1 rounded">scripts/fix-database.sql</code></li>
                    <li>Após executar, <Button onClick={() => window.location.reload()} variant="link" className="p-0 h-auto">recarregue esta página</Button></li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {(dbStatus.friends && dbStatus.friendRequests && dbStatus.notifications) && (
            <Alert className="mb-4 bg-green-900/20 border-green-900">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Banco de dados configurado corretamente</AlertTitle>
              <AlertDescription>
                Todas as tabelas necessárias estão configuradas adequadamente.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {user?.name || 'Usuário'}!</CardTitle>
            <CardDescription>
              ID do jogador: <span className="font-mono">{user?.playerId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>O que você gostaria de fazer hoje?</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={() => router.push('/draft/create')}>Criar Draft</Button>
            <Button variant="outline" onClick={() => router.push('/friends')}>Gerenciar Amigos</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus últimos drafts</CardTitle>
            <CardDescription>
              Drafts recentes que você participou
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastDrafts.length > 0 ? (
              <ul className="space-y-2">
                {lastDrafts.map((draft: any) => (
                  <li key={draft.id} className="border rounded p-2">
                    <div className="flex justify-between items-center">
                      <span>{draft.player1?.name} vs {draft.player2?.name || 'Aguardando oponente'}</span>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/draft/room/${draft.id}`)}>
                        {draft.completed ? 'Ver resultado' : 'Continuar'}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum draft recente encontrado</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/draft/history')}>
              Ver histórico completo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
