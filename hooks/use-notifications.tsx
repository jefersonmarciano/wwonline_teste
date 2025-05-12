"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { useAuth } from "./use-auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export interface Notification {
  id: string
  type: 'draft_invite' | 'friend_request' | 'friend_accepted' | 'system'
  title: string
  message: string
  actionUrl?: string
  relatedId?: string // draft_id, friend_request_id, etc.
  senderId?: string
  read: boolean
  createdAt: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: Error | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  createDraftInviteNotification: (receiverId: string, draftId: string, inviteCode: string) => Promise<boolean>
  acceptDraftInvite: (notificationId: string, draftId: string) => Promise<boolean>
  rejectDraftInvite: (notificationId: string) => Promise<boolean>
  refreshNotifications: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Função para carregar notificações do usuário
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        throw new Error(`Erro ao carregar notificações: ${fetchError.message}`)
      }

      const formattedNotifications: Notification[] = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        actionUrl: item.action_url,
        relatedId: item.related_id,
        senderId: item.sender_id,
        read: item.read,
        createdAt: item.created_at
      }))

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.filter(n => !n.read).length)
    } catch (err) {
      console.error("Erro ao carregar notificações:", err)
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Atualizar notificações quando o usuário mudar
  useEffect(() => {
    fetchNotifications()

    // Configurar o listener para novas notificações
    if (user) {
      const notificationsChannel = supabase
        .channel('notifications-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications()
        })
        .subscribe()

      // Limpar o listener ao desmontar
      return () => {
        notificationsChannel.unsubscribe()
      }
    }
  }, [fetchNotifications, user])

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Erro ao marcar notificação como lida: ${error.message}`)
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err)
    }
  }

  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        throw new Error(`Erro ao marcar todas as notificações como lidas: ${error.message}`)
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      
      setUnreadCount(0)
    } catch (err) {
      console.error("Erro ao marcar todas as notificações como lidas:", err)
    }
  }

  // Excluir notificação
  const deleteNotification = async (notificationId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Erro ao excluir notificação: ${error.message}`)
      }

      // Atualizar estado local
      const deletedNotification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      )
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error("Erro ao excluir notificação:", err)
    }
  }

  // Criar uma notificação de convite para draft
  const createDraftInviteNotification = async (receiverId: string, draftId: string, inviteCode: string) => {
    if (!user) return false

    try {
      // Buscar informações do usuário destinatário para personalizar a notificação
      const { data: receiverData, error: receiverError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', receiverId)
        .single()

      if (receiverError) {
        throw new Error(`Usuário não encontrado: ${receiverError.message}`)
      }

      // Criar a notificação para o usuário convidado
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'draft_invite',
          title: 'Convite para Draft',
          message: `${user.name} convidou você para participar de um draft. Clique para entrar!`,
          action_url: `/draft/join?code=${inviteCode}`,
          related_id: draftId,
          sender_id: user.id,
          read: false,
          created_at: new Date().toISOString()
        })

      if (error) {
        throw new Error(`Erro ao criar notificação: ${error.message}`)
      }

      return true
    } catch (err) {
      console.error("Erro ao criar notificação de convite:", err)
      return false
    }
  }

  // Aceitar um convite de draft
  const acceptDraftInvite = async (notificationId: string, draftId: string) => {
    if (!user) return false

    try {
      // Marcar a notificação como lida
      await markAsRead(notificationId)
      
      // Redirecionar para a sala de draft
      router.push(`/draft/room/${draftId}`)
      
      return true
    } catch (err) {
      console.error("Erro ao aceitar convite de draft:", err)
      return false
    }
  }

  // Rejeitar um convite de draft
  const rejectDraftInvite = async (notificationId: string) => {
    try {
      // Simplesmente exclui a notificação
      await deleteNotification(notificationId)
      return true
    } catch (err) {
      console.error("Erro ao rejeitar convite de draft:", err)
      return false
    }
  }

  // Recarregar notificações manualmente
  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createDraftInviteNotification,
        acceptDraftInvite,
        rejectDraftInvite,
        refreshNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications deve ser usado dentro de um NotificationsProvider")
  }
  return context
} 