"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./use-auth"
import type { DraftState, DraftSettings, DraftPhase } from "@/types/draft"

type DraftContextType = {
  draft: DraftState | null
  settings: DraftSettings
  isLoading: boolean
  error: Error | null
  createDraft: (player2Id?: string) => Promise<string>
  updateDraft: (updatedDraft: Partial<DraftState>) => Promise<void>
  joinDraft: (draftId: string) => Promise<boolean>
  makePick: (characterId: string) => Promise<boolean>
  makeBan: (characterId: string) => Promise<boolean>
  getDraftById: (draftId: string) => Promise<DraftState | null>
  getMyDrafts: () => Promise<DraftState[]>
  resetDraft: () => void
  calculatePoints: (characterId: string) => number
}

const defaultSettings: DraftSettings = {
  maxPicks: 6,
  maxBans: 3,
  maxPreBans: 3,
  pointLimit: 1500,
  characterCosts: {},
  weaponCosts: {},
  constellationMultipliers: {
    0: 1.0,
    1: 1.1,
    2: 1.2,
    3: 1.3,
    4: 1.4,
    5: 1.5,
    6: 1.6,
  },
  refinementMultipliers: {
    1: 1.0,
    2: 1.1,
    3: 1.2,
    4: 1.3,
    5: 1.4,
  },
}

// Contexto para o draft
const DraftContext = createContext<DraftContextType | undefined>(undefined)

export function DraftProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [settings, setSettings] = useState<DraftSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Inscrever-se para receber atualizações em tempo real do draft atual
  useEffect(() => {
    if (!draft?.id) return

    // Inscrever para atualizações em tempo real
    const subscription = supabase
      .channel(`draft-${draft.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'drafts',
        filter: `id=eq.${draft.id}`
      }, (payload) => {
        // Atualizar o draft local quando houver mudanças no banco de dados
        setDraft(payload.new as DraftState)
      })
      .subscribe()

    return () => {
      // Cancelar inscrição ao desmontar ou mudar de draft
      subscription.unsubscribe()
    }
  }, [draft?.id])

  // Carregar configurações do Supabase ao iniciar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('draft_settings')
          .select('*')
          .limit(1)
          .single()

        if (data) {
          setSettings(data as DraftSettings)
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err)
      }
    }

    loadSettings()
  }, [])

  // Criar um novo draft
  const createDraft = useCallback(
    async (player2Id?: string): Promise<string> => {
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      setIsLoading(true)
      setError(null)

      try {
        const draftId = uuidv4()
        const newDraft: DraftState = {
          id: draftId,
          phase: "preban" as DraftPhase,
          turn: "player1",
          player1: {
            id: user.id,
            name: user.name,
            characters: [],
            bans: [],
          },
          player2: {
            id: player2Id || "", // Se não fornecido, fica vazio para ser preenchido quando alguém entrar
            name: "", // Será preenchido quando o jogador 2 entrar
            characters: [],
            bans: [],
          },
          prebans: [],
          picks: {
            player1: [],
            player2: [],
          },
          currentPick: 0,
          maxPicks: settings.maxPicks,
          maxBans: settings.maxBans,
          completed: false,
          winner: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Preparar objeto para salvar no Supabase com snake_case para a coluna currentPick
        const dbDraft = {
          ...newDraft,
          current_pick: newDraft.currentPick, // Adicionar campo com nome em snake_case
          // Remove camelCase field to avoid duplication
          currentPick: undefined
        };

        // Salvar no Supabase
        const { error: saveError } = await supabase
          .from('drafts')
          .insert([dbDraft])

        if (saveError) {
          throw new Error(`Erro ao salvar draft: ${saveError.message}`)
        }

        setDraft(newDraft)
        return draftId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
        setError(new Error(errorMessage))
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [user, settings],
  )

  // Entrar em um draft existente
  const joinDraft = useCallback(
    async (draftId: string): Promise<boolean> => {
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      setIsLoading(true)
      setError(null)

      try {
        // Buscar o draft
        const { data, error } = await supabase
          .from('drafts')
          .select('*')
          .eq('id', draftId)
          .single()

        if (error || !data) {
          throw new Error("Draft não encontrado")
        }

        const currentDraft = data as DraftState

        // Verificar se este draft já tem dois jogadores
        if (currentDraft.player1.id && currentDraft.player2.id) {
          // Verificar se o usuário atual é um dos jogadores
          if (currentDraft.player1.id !== user.id && currentDraft.player2.id !== user.id) {
            throw new Error("Este draft já está cheio")
          }
        } else if (!currentDraft.player2.id) {
          // Atualizar como jogador 2
          const { error: updateError } = await supabase
            .from('drafts')
            .update({
              player2: {
                id: user.id,
                name: user.name,
                characters: [],
                bans: []
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', draftId)

          if (updateError) {
            throw new Error(`Erro ao entrar no draft: ${updateError.message}`)
          }

          // Recarregar o draft atualizado
          const { data: updatedData } = await supabase
            .from('drafts')
            .select('*')
            .eq('id', draftId)
            .single()

          if (updatedData) {
            setDraft(updatedData as DraftState)
          }
        }

        // Se chegou até aqui, está tudo bem
        setDraft(currentDraft)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
        setError(new Error(errorMessage))
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  // Fazer uma escolha de personagem
  const makePick = useCallback(
    async (characterId: string): Promise<boolean> => {
      if (!user || !draft) {
        return false
      }

      // Verificar se é o turno do jogador atual
      const isPlayer1 = draft.player1.id === user.id
      const isPlayer2 = draft.player2.id === user.id
      const isCurrentTurn = (isPlayer1 && draft.turn === "player1") || (isPlayer2 && draft.turn === "player2")

      if (!isCurrentTurn || draft.phase !== "pick") {
        return false
      }

      try {
        const nextTurn = draft.turn === "player1" ? "player2" : "player1"
        
        // Determinar o array correto para atualizar (picks.player1 ou picks.player2)
        const updatedPicks = {
          ...draft.picks,
          [draft.turn]: [...draft.picks[draft.turn], characterId]
        }

        // Aumentar o número do pick atual se passamos pelo ciclo player1 -> player2 -> player1
        const nextCurrentPick = nextTurn === "player1" ? draft.currentPick + 1 : draft.currentPick

        // Verificar se o draft deve mudar para a fase de banimento
        let nextPhase: DraftPhase = draft.phase

        // Banimentos do meio (depois de 8 picks)
        if (nextCurrentPick === 4 && nextTurn === "player1") {
          nextPhase = "ban"
        }

        // Verificar se o draft foi concluído
        const isPickingCompleted = nextCurrentPick === draft.maxPicks && nextTurn === "player1"
        
        // Atualizar no Supabase
        const updateData = {
          picks: updatedPicks,
          turn: nextTurn,
          current_pick: nextCurrentPick, // Usar snake_case aqui
          phase: isPickingCompleted ? "complete" : nextPhase,
          completed: isPickingCompleted,
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from('drafts')
          .update(updateData)
          .eq('id', draft.id)

        if (updateError) {
          console.error("Erro ao fazer pick:", updateError)
          return false
        }

        // Atualizar o estado local
        setDraft({
          ...draft,
          picks: updatedPicks,
          turn: nextTurn,
          currentPick: nextCurrentPick,
          phase: isPickingCompleted ? "complete" : nextPhase,
          completed: isPickingCompleted,
          updated_at: new Date().toISOString()
        })

        return true
      } catch (err) {
        console.error("Erro ao fazer pick:", err)
        return false
      }
    },
    [draft, user],
  )

  // Fazer um banimento
  const makeBan = useCallback(
    async (characterId: string): Promise<boolean> => {
      if (!user || !draft) {
        return false
      }

      // Verificar se é o turno do jogador atual
      const isPlayer1 = draft.player1.id === user.id
      const isPlayer2 = draft.player2.id === user.id
      const isCurrentTurn = (isPlayer1 && draft.turn === "player1") || (isPlayer2 && draft.turn === "player2")

      if (!isCurrentTurn || draft.phase !== "ban") {
        return false
      }

      try {
        const nextTurn = draft.turn === "player1" ? "player2" : "player1"
        
        // Adicionar o personagem aos banimentos do jogador
        const updatedPlayer = draft.turn === "player1" 
          ? { ...draft.player1, bans: [...draft.player1.bans, characterId] }
          : { ...draft.player2, bans: [...draft.player2.bans, characterId] }
        
        // Mudar de volta para a fase de picks após finalizar os banimentos
        let nextPhase: DraftPhase = draft.phase
        
        // Verificar se já concluímos os banimentos do meio
        const player1BansCompleted = draft.player1.bans.length === draft.maxBans || 
                                    (updatedPlayer === draft.player1 && updatedPlayer.bans.length === draft.maxBans)
        const player2BansCompleted = draft.player2.bans.length === draft.maxBans || 
                                    (updatedPlayer === draft.player2 && updatedPlayer.bans.length === draft.maxBans)
        
        // Voltar para picks quando os dois jogadores concluíram seus banimentos
        if (player1BansCompleted && player2BansCompleted) {
          nextPhase = "pick"
        }
        
        // Atualizar no Supabase
        const updateData = {
          [draft.turn]: updatedPlayer,
          turn: nextTurn,
          phase: nextPhase,
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from('drafts')
          .update(updateData)
          .eq('id', draft.id)

        if (updateError) {
          console.error("Erro ao fazer ban:", updateError)
          return false
        }

        // Atualizar o estado local
        setDraft({
          ...draft,
          [draft.turn]: updatedPlayer,
          turn: nextTurn,
          phase: nextPhase,
          updated_at: new Date().toISOString()
        })

        return true
      } catch (err) {
        console.error("Erro ao fazer ban:", err)
        return false
      }
    },
    [draft, user],
  )

  // Atualizar um draft existente
  const updateDraft = useCallback(
    async (updatedDraft: Partial<DraftState>): Promise<void> => {
      if (!draft?.id) {
        throw new Error("Nenhum draft selecionado")
      }

      setIsLoading(true)
      setError(null)

      try {
        // Preparar os dados para o formato esperado pelo banco de dados (snake_case)
        const dbUpdate: any = { ...updatedDraft };
        
        // Se estiver atualizando currentPick, usar o nome da coluna em snake_case
        if (updatedDraft.currentPick !== undefined) {
          dbUpdate.current_pick = updatedDraft.currentPick;
          delete dbUpdate.currentPick;
        }

        // Certificar-se que outros campos camelCase são convertidos para snake_case
        if (updatedDraft.maxPicks !== undefined) {
          dbUpdate.max_picks = updatedDraft.maxPicks;
          delete dbUpdate.maxPicks;
        }
        
        if (updatedDraft.maxBans !== undefined) {
          dbUpdate.max_bans = updatedDraft.maxBans;
          delete dbUpdate.maxBans;
        }

        // Adicionar timestamp de atualização
        dbUpdate.updated_at = new Date().toISOString();

        const { error } = await supabase
          .from('drafts')
          .update(dbUpdate)
          .eq('id', draft.id)

        if (error) {
          throw new Error(`Erro ao atualizar draft: ${error.message}`)
        }

        // Atualizar o estado local
        setDraft({
          ...draft,
          ...updatedDraft,
          updated_at: dbUpdate.updated_at
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
        setError(new Error(errorMessage))
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [draft]
  )

  // Buscar um draft específico pelo ID
  const getDraftById = useCallback(
    async (draftId: string): Promise<DraftState | null> => {
      try {
        const { data, error } = await supabase
          .from('drafts')
          .select('*')
          .eq('id', draftId)
          .single()

        if (error || !data) {
          return null
        }

        // Mapear current_pick para currentPick se necessário
        const draftData = data as any;
        const draft: DraftState = {
          ...draftData,
          currentPick: draftData.current_pick !== undefined ? draftData.current_pick : draftData.currentPick || 0,
        };

        return draft;
      } catch (err) {
        console.error("Erro ao obter draft:", err)
        return null
      }
    },
    [],
  )

  // Buscar todos os drafts do usuário atual
  const getMyDrafts = useCallback(async (): Promise<DraftState[]> => {
    if (!user) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .or(`player1->id.eq.${user.id},player2->id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Erro ao buscar drafts:", error)
        return []
      }

      // Mapear current_pick para currentPick se necessário
      const drafts = (data || []).map((draft: any) => ({
        ...draft,
        currentPick: draft.current_pick !== undefined ? draft.current_pick : draft.currentPick || 0,
      }));

      return drafts
    } catch (err) {
      console.error("Erro ao buscar drafts:", err)
      return []
    }
  }, [user])

  // Resetar o draft atual
  const resetDraft = useCallback(() => {
    setDraft(null)
  }, [])

  // Calcular pontos para um personagem
  const calculatePoints = useCallback(
    (characterId: string): number => {
      // Implementação básica - pode ser expandida conforme necessário
      return settings.characterCosts[characterId] || 0
    },
    [settings],
  )

  return (
    <DraftContext.Provider
      value={{
        draft,
        settings,
        isLoading,
        error,
        createDraft,
        updateDraft,
        joinDraft,
        makePick,
        makeBan,
        getDraftById,
        getMyDrafts,
        resetDraft,
        calculatePoints,
      }}
    >
      {children}
    </DraftContext.Provider>
  )
}

// Hook para usar o contexto do draft
export function useDraft() {
  const context = useContext(DraftContext)
  if (context === undefined) {
    throw new Error("useDraft must be used within a DraftProvider")
  }
  return context
}
