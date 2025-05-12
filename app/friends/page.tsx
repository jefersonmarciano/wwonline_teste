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
import MainLayout from "@/components/layouts/main-layout"

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
    <MainLayout>
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
              <CardContent>
                <div className="flex items-center p-3 bg-muted rounded-md">
                  <KeyRound className="h-5 w-5 text-primary mr-2" />
                  <span className="text-lg font-mono tracking-wide">{user?.playerId || "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Card com status de amigos */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-2 rounded-full">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span>Total de amigos</span>
                  </div>
                  <span className="font-semibold">{friends.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-500/20 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </div>
                    <span>Solicitações pendentes</span>
                  </div>
                  <span className="font-semibold">{pendingRequests.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <UserPlus className="h-4 w-4 text-blue-500" />
                    </div>
                    <span>Solicitações enviadas</span>
                  </div>
                  <span className="font-semibold">{sentRequests.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="friends">
                  Amigos ({friends.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Solicitações ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="sent">
                  Enviadas ({sentRequests.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="friends" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Carregando amigos...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Nenhum amigo ainda</h3>
                    <p className="text-muted-foreground mb-6">
                      Você ainda não tem amigos adicionados.
                    </p>
                    <div className="flex justify-center">
                      <Button variant="secondary" className="mr-2">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Amigo
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friends.map((friend) => (
                      <Card key={friend.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>{friend.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{friend.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {friend.online ? (
                                    <span className="text-green-500 flex items-center">
                                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                                      Online
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground flex items-center">
                                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
                                      Visto {formatLastActive(friend.lastActive)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-3"
                                onClick={() => router.push(`/draft/create?opponent=${friend.playerId}`)}
                              >
                                Convidar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => removeFriend(friend.id)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pending" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Carregando solicitações...</p>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Nenhuma solicitação pendente</h3>
                    <p className="text-muted-foreground">
                      Você não tem solicitações de amizade para responder.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>{request.senderName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.senderName || 'Usuário'}</p>
                                <p className="text-xs text-muted-foreground">
                                  Enviado {formatLastActive(request.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-8 px-3"
                                onClick={() => acceptFriendRequest(request.id)}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                Aceitar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 px-3"
                                onClick={() => rejectFriendRequest(request.id)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Recusar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sent" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Carregando convites enviados...</p>
                  </div>
                ) : sentRequests.length === 0 ? (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Nenhum convite enviado</h3>
                    <p className="text-muted-foreground">
                      Você não tem solicitações de amizade pendentes enviadas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>{request.receiverName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.receiverName || 'Usuário'}</p>
                                <p className="text-xs text-muted-foreground">
                                  Enviado {formatLastActive(request.created_at)}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 px-3"
                              onClick={() => cancelFriendRequest(request.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              Cancelar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 