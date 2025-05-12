"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Gamepad2, 
  Users, 
  ShieldPlus,
  KeyRound,
  History,
  Settings,
  Plus,
  UserPlus,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layouts/main-layout"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
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

  // Verificar se o usuário está autenticado
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  const features = [
    {
      title: "Criar Nova Sala",
      description: "Inicie um novo draft e convide um oponente",
      icon: <Gamepad2 className="h-6 w-6" />,
      action: () => router.push("/draft/create"),
      variant: "default" as const,
      priority: true
    },
    {
      title: "Entrar com Código",
      description: "Use um código de convite para entrar em uma sala",
      icon: <KeyRound className="h-6 w-6" />,
      action: () => router.push("/draft/join"),
      variant: "outline" as const,
      priority: true
    },
    {
      title: "Histórico de Drafts",
      description: "Veja seus drafts anteriores e em andamento",
      icon: <History className="h-6 w-6" />,
      action: () => router.push("/draft/history"),
      variant: "outline" as const,
      priority: false
    },
    {
      title: "Gerenciar Equipes",
      description: "Crie e edite suas equipes para os drafts",
      icon: <Users className="h-6 w-6" />,
      action: () => router.push("/teams"),
      variant: "outline" as const,
      priority: false
    },
    {
      title: "Coleção",
      description: "Gerencie sua coleção de personagens e armas",
      icon: <ShieldPlus className="h-6 w-6" />,
      action: () => router.push("/collection"),
      variant: "outline" as const,
      priority: false
    },
    {
      title: "Configurações",
      description: "Ajuste suas preferências e informações de perfil",
      icon: <Settings className="h-6 w-6" />,
      action: () => router.push("/settings"),
      variant: "outline" as const,
      priority: false
    }
  ]

  // Filtrar as funcionalidades prioritárias
  const priorityFeatures = features.filter(f => f.priority)
  const otherFeatures = features.filter(f => !f.priority)

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Alertas de status do banco de dados */}
        {isDbChecking ? (
          <Alert className="mb-6">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertTitle>Verificando estrutura do banco de dados...</AlertTitle>
            <AlertDescription>
              Estamos verificando se as tabelas necessárias estão configuradas corretamente.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {(!dbStatus.friends || !dbStatus.friendRequests || !dbStatus.notifications) && (
              <Alert variant="destructive" className="mb-6">
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
          </>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bem-vindo, {user?.name}</h1>
          <p className="text-muted-foreground">
            O que você gostaria de fazer hoje?
          </p>
        </div>

        {/* Ações principais */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {priorityFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`flex-1 overflow-hidden border-2 ${feature.title === "Entrar com Código" ? "border-blue-500 shadow-md shadow-blue-500/20" : "border-primary"}`}
            >
              <CardHeader className={`pb-2 ${feature.title === "Entrar com Código" ? "bg-blue-500/10" : ""}`}>
                <CardTitle className="flex items-center gap-2">
                  {feature.icon}
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  variant={feature.title === "Entrar com Código" ? "default" : feature.variant} 
                  className="w-full" 
                  onClick={feature.action}
                >
                  {feature.title === "Criar Nova Sala" ? (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Criar Agora</span>
                    </div>
                  ) : feature.title === "Entrar com Código" ? (
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      <span>Entrar com Código</span>
                    </div>
                  ) : "Acessar"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Outras funcionalidades */}
        <h2 className="text-xl font-medium mb-4">Outras funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {otherFeatures.map((feature, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {feature.icon}
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  variant={feature.variant} 
                  className="w-full" 
                  onClick={feature.action}
                >
                  Acessar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="hover:shadow-md transition-shadow mt-8">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <span>Amigos</span>
            </CardTitle>
            <CardDescription>Gerencie sua lista de amigos e convites</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Adicione amigos para facilitar o convite para salas de draft. Veja quem está online e compartilhe seus decks favoritos.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => router.push("/friends")}
            >
              Ver Amigos
            </Button>
          </CardFooter>
        </Card>

        {user?.playerId && (
          <div className="mt-8 p-4 bg-muted rounded-md">
            <p className="text-sm flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-500" />
              <span>
                <span className="font-medium">Seu ID de jogador:</span> {user.playerId}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Compartilhe este ID com outros jogadores para que eles possam te convidar para drafts.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
