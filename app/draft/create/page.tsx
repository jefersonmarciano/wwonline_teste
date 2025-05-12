"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useDraft } from "@/hooks/use-draft"
import { useTeams } from "@/hooks/use-teams"
import { useFriends } from "@/hooks/use-friends"
import { useNotifications } from "@/hooks/use-notifications"
import { Shield, Info, Users, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Suspense } from "react"

// Componente interno que usa searchParams
function CreateDraftForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { createDraft } = useDraft()
  const { getDecks } = useTeams()
  const { friends } = useFriends()
  const { createDraftInviteNotification } = useNotifications()
  
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [opponentId, setOpponentId] = useState<string>("")
  const [selectedFriendId, setSelectedFriendId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [notificationSent, setNotificationSent] = useState(false)
  
  const decks = getDecks()

  // Verificar se há um oponente na URL
  useEffect(() => {
    const opponentFromUrl = searchParams?.get('opponent')
    if (opponentFromUrl) {
      setOpponentId(opponentFromUrl)
    }
  }, [searchParams])
  
  // Quando um amigo é selecionado, preencher o ID do oponente
  useEffect(() => {
    if (selectedFriendId) {
      const friend = friends.find(f => f.id === selectedFriendId)
      if (friend) {
        setOpponentId(friend.playerId)
      }
    }
  }, [selectedFriendId, friends])
  
  // Verificar se o usuário está logado
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    router.push("/login")
    return null
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsCreating(true)
    setNotificationSent(false)
    
    try {
      // Verificar se um deck foi selecionado
      if (!selectedDeckId) {
        setError("Por favor, selecione um deck para o torneio")
        setIsCreating(false)
        return
      }
      
      // Se um ID de oponente foi fornecido, verificar se ele existe
      let opponentUserId = ""
      if (opponentId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('player_id', opponentId)
          .single()
          
        if (error || !data) {
          setError("Oponente não encontrado. Verifique o ID do jogador.")
          setIsCreating(false)
          return
        }
        
        opponentUserId = data.id
      }
      
      // Criar o draft
      const draftId = await createDraft(opponentUserId)
      
      // Gerar um código de convite aleatório
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      // Salvar informações adicionais sobre o draft
      await supabase
        .from('draft_details')
        .insert([{
          draft_id: draftId,
          player1_deck_id: selectedDeckId,
          player2_deck_id: null,
          status: 'waiting', // Esperando oponente
          invite_code: inviteCode
        }])
      
      // Se um oponente foi especificado, enviar uma notificação
      if (opponentUserId) {
        const notificationSent = await createDraftInviteNotification(
          opponentUserId, 
          draftId,
          inviteCode
        )
        setNotificationSent(notificationSent)
      }
      
      // Redirecionar para a sala de draft
      router.push(`/draft/room/${draftId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar sala de draft")
      setIsCreating(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Criar Nova Sala de Draft</h1>
      
      <div className="max-w-2xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {notificationSent && (
          <Alert className="mb-6 bg-green-700 text-white border-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Convite Enviado</AlertTitle>
            <AlertDescription>
              Uma notificação foi enviada para o oponente.
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Sala</CardTitle>
            <CardDescription>
              Configure sua sala de draft e convide um oponente
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deck">Seu Deck</Label>
                {decks.length === 0 ? (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Você não possui nenhum deck para torneio. Crie um deck com pelo menos 15 personagens.
                    </p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => router.push("/teams/create")}
                    >
                      Criar Deck
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {decks.map((deck) => (
                      <div 
                        key={deck.id}
                        className={`
                          p-3 rounded-md border cursor-pointer
                          ${selectedDeckId === deck.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border bg-card hover:bg-muted/50'
                          }
                        `}
                        onClick={() => setSelectedDeckId(deck.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{deck.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {deck.characters.length} personagens • Custo: {deck.totalCost}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Seleção de amigos */}
              {friends.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="friend">Convidar Amigo</Label>
                  <Select 
                    value={selectedFriendId} 
                    onValueChange={setSelectedFriendId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um amigo para convidar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Selecionar amigo --</SelectItem>
                      {friends.map((friend) => (
                        <SelectItem key={friend.id} value={friend.id}>
                          {friend.name} {friend.online && '(Online)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>Ou digite um ID manualmente</p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => router.push('/friends')}
                    >
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      Gerenciar Amigos
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="opponentId">ID do Oponente</Label>
                <Input
                  id="opponentId"
                  placeholder="Digite o ID do oponente"
                  value={opponentId}
                  onChange={(e) => {
                    setOpponentId(e.target.value)
                    setSelectedFriendId("")
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Se não informado, qualquer jogador poderá entrar usando o link da sala.
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Como funciona o draft?</p>
                    <p>O draft segue a ordem:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Banimentos iniciais: Jogador 1 → Jogador 2</li>
                      <li>Picks iniciais (4 rodadas): Jogador 1 → Jogador 2</li>
                      <li>Banimentos do meio: Jogador 1 → Jogador 2</li>
                      <li>Picks finais (3 rodadas): Jogador 1 → Jogador 2</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || decks.length === 0 || !selectedDeckId}
              >
                {isCreating ? "Criando..." : "Criar Sala"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {user?.playerId && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-sm">
              <span className="font-medium">Seu ID de jogador:</span> {user.playerId}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Compartilhe este ID com outros jogadores para que eles possam te convidar para drafts.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Página principal com Suspense para o useSearchParams
export default function CreateDraftPage() {
  return (
    <Suspense fallback={
      <div className="container py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <CreateDraftForm />
    </Suspense>
  )
}
