"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { useAuth } from "./use-auth"
import { supabase } from "@/lib/supabase"

interface Friend {
  id: string
  name: string
  playerId: string
  avatar?: string
  online?: boolean
  lastActive?: string
}

interface FriendRequest {
  id: string
  senderId: string
  senderName?: string
  senderPlayerId?: string
  receiverId: string
  receiverName?: string
  receiverPlayerId?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

interface FriendsContextType {
  friends: Friend[]
  pendingRequests: FriendRequest[]
  sentRequests: FriendRequest[]
  isLoading: boolean
  error: Error | null
  addFriend: (playerId: string) => Promise<{ success: boolean; error?: string }>
  removeFriend: (friendId: string) => Promise<{ success: boolean; error?: string }>
  acceptFriendRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>
  rejectFriendRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>
  cancelFriendRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>
  refreshFriends: () => Promise<void>
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined)

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Carregar amigos e solicitações
  const fetchFriendsAndRequests = useCallback(async () => {
    if (!user) {
      setFriends([])
      setPendingRequests([])
      setSentRequests([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Buscar amigos no Supabase
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select(`
          id,
          friend_id,
          profiles:friend_id (id, name, player_id, avatar_url, last_active)
        `)
        .eq('user_id', user.id)

      if (friendsError) {
        throw new Error(`Erro ao carregar amigos: ${friendsError.message}`)
      }

      // Buscar solicitações pendentes recebidas
      const { data: pendingData, error: pendingError } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          sender:sender_id (name, player_id),
          receiver_id,
          status,
          created_at
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      if (pendingError) {
        throw new Error(`Erro ao carregar solicitações pendentes: ${pendingError.message}`)
      }

      // Buscar solicitações enviadas
      const { data: sentData, error: sentError } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          receiver:receiver_id (name, player_id),
          status,
          created_at
        `)
        .eq('sender_id', user.id)
        .eq('status', 'pending')

      if (sentError) {
        throw new Error(`Erro ao carregar solicitações enviadas: ${sentError.message}`)
      }

      // Formatar os amigos
      const formattedFriends = friendsData.map((item: any) => ({
        id: item.id,
        name: item.profiles.name,
        playerId: item.profiles.player_id,
        avatar: item.profiles.avatar_url,
        lastActive: item.profiles.last_active,
        online: item.profiles.last_active ? 
                new Date(item.profiles.last_active).getTime() > Date.now() - 1000 * 60 * 5 
                : false
      }))

      // Formatar solicitações pendentes
      const formattedPending = pendingData.map((item: any) => ({
        id: item.id,
        senderId: item.sender_id,
        senderName: item.sender.name,
        senderPlayerId: item.sender.player_id,
        receiverId: item.receiver_id,
        status: item.status,
        createdAt: item.created_at
      }))

      // Formatar solicitações enviadas
      const formattedSent = sentData.map((item: any) => ({
        id: item.id,
        senderId: item.sender_id,
        receiverId: item.receiver_id,
        receiverName: item.receiver.name,
        receiverPlayerId: item.receiver.player_id,
        status: item.status,
        createdAt: item.created_at
      }))

      setFriends(formattedFriends)
      setPendingRequests(formattedPending)
      setSentRequests(formattedSent)
    } catch (err) {
      console.error("Erro ao carregar amigos:", err)
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Atualizar status de online dos amigos
  const updateOnlineStatus = useCallback(async () => {
    if (!user) return
    
    // Atualizar status do usuário atual
    await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('id', user.id)
  }, [user])

  // Carregar amigos quando o usuário mudar
  useEffect(() => {
    fetchFriendsAndRequests()
    
    // Configurar intervalo para atualizar status de online
    const intervalId = setInterval(updateOnlineStatus, 60000) // a cada minuto
    
    // Atualizar status ao montar
    updateOnlineStatus()
    
    // Configura o listener de tempo real para amigos e solicitações
    const friendsChannel = supabase
      .channel('friends-changes')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'friends',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchFriendsAndRequests()
      })
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'friend_requests',
        filter: `receiver_id=eq.${user?.id}`
      }, () => {
        fetchFriendsAndRequests()
      })
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'friend_requests',
        filter: `sender_id=eq.${user?.id}`
      }, () => {
        fetchFriendsAndRequests()
      })
      .subscribe()

    // Limpar listener ao desmontar
    return () => {
      clearInterval(intervalId)
      friendsChannel.unsubscribe()
    }
  }, [fetchFriendsAndRequests, updateOnlineStatus, user])

  // Adicionar amigo (enviar solicitação)
  const addFriend = async (playerId: string) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    if (!playerId) {
      return { success: false, error: "ID do jogador não fornecido" }
    }

    try {
      // Verificar se o jogador existe
      const { data: receiverData, error: receiverError } = await supabase
        .from('profiles')
        .select('id')
        .eq('player_id', playerId)
        .single()

      if (receiverError || !receiverData) {
        return { success: false, error: "Jogador não encontrado" }
      }

      const receiverId = receiverData.id

      // Verificar se não está tentando adicionar a si mesmo
      if (receiverId === user.id) {
        return { success: false, error: "Você não pode adicionar a si mesmo como amigo" }
      }

      // Verificar se já são amigos
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('id')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${user.id})`)
        .maybeSingle()

      if (existingFriend) {
        return { success: false, error: "Vocês já são amigos" }
      }

      // Verificar se já existe uma solicitação pendente
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('id, status')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .eq('status', 'pending')
        .maybeSingle()

      if (existingRequest) {
        return { success: false, error: "Já existe uma solicitação de amizade pendente" }
      }

      // Criar solicitação de amizade
      const { error: requestError } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (requestError) {
        throw new Error(`Erro ao enviar solicitação: ${requestError.message}`)
      }

      // Recarregar dados
      await fetchFriendsAndRequests()

      return { success: true }
    } catch (err) {
      console.error("Erro ao adicionar amigo:", err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Erro desconhecido ao adicionar amigo" 
      }
    }
  }

  // Remover amigo
  const removeFriend = async (friendId: string) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    try {
      // Remover registro de amizade em ambas as direções
      const { error: removeError } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendId)

      if (removeError) {
        throw new Error(`Erro ao remover amigo: ${removeError.message}`)
      }

      // Atualizar lista
      await fetchFriendsAndRequests()

      return { success: true }
    } catch (err) {
      console.error("Erro ao remover amigo:", err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Erro desconhecido ao remover amigo" 
      }
    }
  }

  // Aceitar solicitação
  const acceptFriendRequest = async (requestId: string) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    try {
      // Buscar informações da solicitação
      const { data: requestData, error: requestError } = await supabase
        .from('friend_requests')
        .select('sender_id, receiver_id')
        .eq('id', requestId)
        .single()

      if (requestError || !requestData) {
        throw new Error("Solicitação não encontrada")
      }

      // Verificar se o usuário é o destinatário
      if (requestData.receiver_id !== user.id) {
        return { success: false, error: "Você não tem permissão para aceitar esta solicitação" }
      }

      // Atualizar status da solicitação
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      // Criar registros de amizade em ambas as direções
      await supabase.from('friends').insert([
        { user_id: user.id, friend_id: requestData.sender_id },
        { user_id: requestData.sender_id, friend_id: user.id }
      ])

      // Atualizar listas
      await fetchFriendsAndRequests()

      return { success: true }
    } catch (err) {
      console.error("Erro ao aceitar solicitação:", err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Erro desconhecido ao aceitar solicitação" 
      }
    }
  }

  // Rejeitar solicitação
  const rejectFriendRequest = async (requestId: string) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    try {
      // Atualizar status da solicitação
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('receiver_id', user.id) // Garantir que o usuário é o destinatário

      if (error) {
        throw new Error(`Erro ao rejeitar solicitação: ${error.message}`)
      }

      // Atualizar listas
      await fetchFriendsAndRequests()

      return { success: true }
    } catch (err) {
      console.error("Erro ao rejeitar solicitação:", err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Erro desconhecido ao rejeitar solicitação" 
      }
    }
  }

  // Cancelar solicitação enviada
  const cancelFriendRequest = async (requestId: string) => {
    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    try {
      // Excluir a solicitação (apenas se o usuário for o remetente)
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId)
        .eq('sender_id', user.id) // Garantir que o usuário é o remetente

      if (error) {
        throw new Error(`Erro ao cancelar solicitação: ${error.message}`)
      }

      // Atualizar listas
      await fetchFriendsAndRequests()

      return { success: true }
    } catch (err) {
      console.error("Erro ao cancelar solicitação:", err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Erro desconhecido ao cancelar solicitação" 
      }
    }
  }

  // Recarregar amigos manualmente
  const refreshFriends = async () => {
    await fetchFriendsAndRequests()
  }

  return (
    <FriendsContext.Provider
      value={{
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
      }}
    >
      {children}
    </FriendsContext.Provider>
  )
}

export const useFriends = () => {
  const context = useContext(FriendsContext)
  if (context === undefined) {
    throw new Error("useFriends deve ser usado dentro de um FriendsProvider")
  }
  return context
} 