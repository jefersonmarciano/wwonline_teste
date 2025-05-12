"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useDraft } from "@/hooks/use-draft"
import { Clock, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { DraftState } from "@/types/draft"

export default function DraftHistoryPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { getMyDrafts } = useDraft()
  
  const [drafts, setDrafts] = useState<DraftState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    const loadDrafts = async () => {
      setIsLoading(true)
      try {
        const userDrafts = await getMyDrafts()
        setDrafts(userDrafts)
      } catch (error) {
        console.error("Erro ao carregar drafts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDrafts()
  }, [isAuthenticated, authLoading, router, getMyDrafts])
  
  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data desconhecida"
    
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
  }
  
  // Obter status do draft
  const getDraftStatus = (draft: DraftState) => {
    if (draft.completed) {
      return { label: "Completo", color: "bg-green-500" }
    }
    
    if (!draft.player2.id) {
      return { label: "Aguardando oponente", color: "bg-yellow-500" }
    }
    
    return { label: "Em andamento", color: "bg-blue-500" }
  }
  
  if (authLoading || isLoading) {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Histórico de Drafts</h1>
        <Button onClick={() => router.push("/draft/create")}>Criar Novo Draft</Button>
      </div>
      
      {drafts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-lg">Você ainda não participou de nenhum draft.</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push("/draft/create")}
            >
              Criar Seu Primeiro Draft
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drafts.map(draft => {
            const status = getDraftStatus(draft)
            const isPlayer1 = draft.player1.id === user?.id
            const opponent = isPlayer1 ? draft.player2 : draft.player1
            
            return (
              <Card key={draft.id} className="overflow-hidden">
                <CardHeader className="bg-muted pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{isPlayer1 ? "Seu draft" : `Draft de ${draft.player1.name}`}</CardTitle>
                    <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center mt-2">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(draft.created_at)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="font-medium">{draft.player1.name || "Jogador 1"}</div>
                      <div className="text-sm text-muted-foreground">
                        {draft.picks.player1.length} personagens
                      </div>
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    
                    <div className="text-center">
                      <div className="font-medium">
                        {draft.player2.name || "Aguardando oponente"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {draft.picks.player2.length} personagens
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/draft/room/${draft.id}`)}
                  >
                    {draft.completed ? "Ver Resultado" : "Continuar Draft"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 