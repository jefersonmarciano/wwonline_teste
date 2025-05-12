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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Salvar no Supabase
        const { error: saveError } = await supabase
          .from('drafts')
          .insert([newDraft])

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
              updatedAt: new Date().toISOString()
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

        // Verificar se o draft está completo (após 16 seleções)
        const completed = nextCurrentPick > 8

        const updates = {
          picks: updatedPicks,
          turn: nextTurn,
          currentPick: nextCurrentPick,
          phase: nextPhase,
          completed,
          updatedAt: new Date().toISOString()
        }

        // Atualizar no Supabase
        const { error } = await supabase
          .from('drafts')
          .update(updates)
          .eq('id', draft.id)

        if (error) {
          throw new Error(`Erro ao fazer pick: ${error.message}`)
        }

        // O draft será atualizado automaticamente pelo listener em tempo real
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

      if (!isCurrentTurn || (draft.phase !== "preban" && draft.phase !== "ban")) {
        return false
      }

      try {
        const nextTurn = draft.turn === "player1" ? "player2" : "player1"
        
        let updates: any = {}
        
        // Determinar o que atualizar com base na fase atual
        if (draft.phase === "preban") {
          // Pré-banimentos
          const updatedPrebans = [...draft.prebans, characterId]
          updates.prebans = updatedPrebans
          
          // Se o player2 completou seus pré-banimentos, vamos para a fase de picks
          if (nextTurn === "player1" && updatedPrebans.length >= 4) {
            updates.phase = "pick"
          }
        } else {
          // Banimentos do meio do jogo
          const playerKey = draft.turn
          
          // Atualizar os bans do jogador atual
          updates[`player${draft.turn === "player1" ? "1" : "2"}`] = {
            ...draft[playerKey],
            bans: [...draft[playerKey].bans, characterId]
          }
          
          // Se o player2 fez seu ban do meio, voltar para picks
          if (nextTurn === "player1") {
            updates.phase = "pick"
          }
        }
        
        updates.turn = nextTurn
        updates.updatedAt = new Date().toISOString()

        // Atualizar no Supabase
        const { error } = await supabase
          .from('drafts')
          .update(updates)
          .eq('id', draft.id)

        if (error) {
          throw new Error(`Erro ao fazer ban: ${error.message}`)
        }

        // O draft será atualizado automaticamente pelo listener em tempo real
        return true
      } catch (err) {
        console.error("Erro ao fazer ban:", err)
        return false
      }
    },
    [draft, user],
  )

  // Atualizar o draft
  const updateDraft = useCallback(async (updatedDraft: Partial<DraftState>) => {
    if (!draft) return

    try {
      const updates = {
        ...updatedDraft,
        updatedAt: new Date().toISOString()
      }

      // Atualizar no Supabase
      const { error } = await supabase
        .from('drafts')
        .update(updates)
        .eq('id', draft.id)

      if (error) {
        throw new Error(`Erro ao atualizar draft: ${error.message}`)
      }

      // O draft será atualizado automaticamente pelo listener em tempo real
    } catch (err) {
      console.error("Erro ao atualizar draft:", err)
    }
  }, [draft])

  // Buscar um draft específico pelo ID
  const getDraftById = useCallback(async (draftId: string): Promise<DraftState | null> => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', draftId)
        .single()

      if (error) {
        throw error
      }

      const loadedDraft = data as DraftState
      setDraft(loadedDraft)
      return loadedDraft
    } catch (err) {
      console.error("Erro ao buscar draft:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Buscar todos os drafts do usuário atual
  const getMyDrafts = useCallback(async (): Promise<DraftState[]> => {
    if (!user) return []
    
    setIsLoading(true)
    
    try {
      // Buscar drafts onde o usuário é jogador 1 ou jogador 2
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .or(`player1->>id.eq.${user.id},player2->>id.eq.${user.id}`)
        .order('createdAt', { ascending: false })

      if (error) {
        throw error
      }

      return data as DraftState[]
    } catch (err) {
      console.error("Erro ao buscar drafts:", err)
      return []
    } finally {
      setIsLoading(false)
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
