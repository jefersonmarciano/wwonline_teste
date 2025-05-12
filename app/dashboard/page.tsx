"use client"

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
  Plus
} from "lucide-react"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

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
    <div className="container mx-auto py-8 px-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
  )
}
