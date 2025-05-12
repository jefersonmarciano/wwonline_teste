"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useFriends } from "@/hooks/use-friends"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  Users,
  UserMinus,
  XCircle,
  RefreshCw,
  UserCircle,
  KeyRound
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function FriendsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { 
    friends, 
    pendingRequests, 
    sentRequests, 
    isLoading, 
    error,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    refreshFriends
  } = useFriends()
  
  const [playerIdInput, setPlayerIdInput] = useState("")
  const [addingFriend, setAddingFriend] = useState(false)
  const [addFriendError, setAddFriendError] = useState<string | null>(null)
  const [addFriendSuccess, setAddFriendSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("friends")
  const [refreshing, setRefreshing] = useState(false)

  // Verificar autenticação
  if (authLoading) {
    return <div className="container py-8">Carregando...</div>
  }

  if (!isAuthenticated) {
    router.push("/login?redirect=/friends")
    return null
  }

  // Função para adicionar um amigo pelo ID do jogador
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddFriendError(null)
    setAddFriendSuccess(false)
    
    if (!playerIdInput.trim()) {
      setAddFriendError("Por favor, digite um ID de jogador")
      return
    }
    
    setAddingFriend(true)
    
    try {
      const result = await addFriend(playerIdInput.trim())
      
      if (result.success) {
        setAddFriendSuccess(true)
        setPlayerIdInput("")
        setTimeout(() => setAddFriendSuccess(false), 3000)
      } else {
        setAddFriendError(result.error || "Erro ao adicionar amigo")
      }
    } catch (err) {
      setAddFriendError("Erro ao processar a solicitação")
    } finally {
      setAddingFriend(false)
    }
  }

  // Função para atualizar a lista de amigos
  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshFriends()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Função para formatar a data de última atividade
  const formatLastActive = (dateString?: string) => {
    if (!dateString) return "Nunca"
    
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return "Data inválida"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Amigos</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card para adicionar amigos */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Amigo</CardTitle>
              <CardDescription>
                Adicione um amigo usando o ID do jogador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFriend} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="ID do jogador"
                    value={playerIdInput}
                    onChange={(e) => setPlayerIdInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite o ID de um jogador para enviar uma solicitação de amizade
                  </p>
                </div>

                {addFriendError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{addFriendError}</AlertDescription>
                  </Alert>
                )}

                {addFriendSuccess && (
                  <Alert className="bg-green-700 text-white border-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>
                      Solicitação de amizade enviada!
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleAddFriend}
                disabled={addingFriend || !playerIdInput.trim()}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {addingFriend ? "Enviando..." : "Adicionar Amigo"}
              </Button>
            </CardFooter>
          </Card>

          {/* Card com seu ID de jogador */}
          <Card>
            <CardHeader>
              <CardTitle>Seu ID de Jogador</CardTitle>
              <CardDescription>
                Compartilhe com outros jogadores para que eles possam te adicionar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-md p-4 flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-primary" />
                <div className="font-mono text-lg font-medium">{user?.playerId}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                Seu ID é único e permite que outros jogadores te encontrem facilmente.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (user?.playerId) {
                    navigator.clipboard.writeText(user.playerId)
                  }
                }}
              >
                Copiar ID
              </Button>
            </CardFooter>
          </Card>

          {/* Card com estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>
                Acompanhe suas conexões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Total de amigos:</span>
                </div>
                <span className="font-bold">{friends.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span>Solicitações pendentes:</span>
                </div>
                <span className="font-bold">{pendingRequests.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-500" />
                  <span>Solicitações enviadas:</span>
                </div>
                <span className="font-bold">{sentRequests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com lista de amigos e solicitações */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="friends">
              Amigos ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Solicitações Recebidas ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Solicitações Enviadas ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lista de Amigos
                </CardTitle>
                <CardDescription>
                  Gerencie sua lista de amigos e veja quem está online
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Carregando amigos...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Você ainda não tem amigos.</p>
                    <p className="text-sm text-muted-foreground">
                      Adicione amigos usando o ID do jogador para começar.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {friends.map((friend) => (
                      <li key={friend.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback>
                                {friend.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div 
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                                friend.online ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            ></div>
                          </div>
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {friend.online 
                                ? 'Online agora' 
                                : `Visto ${formatLastActive(friend.lastActive)}`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/draft/create?opponent=${friend.playerId}`)}
                          >
                            Convidar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeFriend(friend.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Solicitações Recebidas
                </CardTitle>
                <CardDescription>
                  Solicitações de amizade pendentes que você recebeu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Carregando solicitações...</p>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="py-8 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Nenhuma solicitação pendente.</p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {pendingRequests.map((request) => (
                      <li key={request.id} className="py-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {request.senderName?.substring(0, 2).toUpperCase() || 'US'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.senderName}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {request.senderPlayerId}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatLastActive(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectFriendRequest(request.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            Recusar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => acceptFriendRequest(request.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            Aceitar
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Solicitações Enviadas
                </CardTitle>
                <CardDescription>
                  Solicitações de amizade que você enviou e aguardam resposta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Carregando solicitações...</p>
                  </div>
                ) : sentRequests.length === 0 ? (
                  <div className="py-8 text-center">
                    <UserPlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Nenhuma solicitação enviada.</p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {sentRequests.map((request) => (
                      <li key={request.id} className="py-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {request.receiverName?.substring(0, 2).toUpperCase() || 'US'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.receiverName}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {request.receiverPlayerId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xs text-muted-foreground">
                              {formatLastActive(request.createdAt)}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground"
                              onClick={() => cancelFriendRequest(request.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 