"use client"

import { useState, useEffect } from "react"
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Eye,
  Trash2, 
  Users,
  Gamepad
} from "lucide-react"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function NotificationPanel() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    acceptDraftInvite,
    rejectDraftInvite
  } = useNotifications()
  const [open, setOpen] = useState(false)

  // Ao fechar o painel, marcar todas as notificações como lidas
  useEffect(() => {
    if (!open && unreadCount > 0) {
      markAllAsRead()
    }
  }, [open, unreadCount, markAllAsRead])

  // Função para renderizar o ícone baseado no tipo de notificação
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'draft_invite':
        return <Gamepad className="h-5 w-5 text-blue-500" />
      case 'friend_request':
        return <Users className="h-5 w-5 text-green-500" />
      case 'friend_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-primary" />
    }
  }

  // Função para lidar com a aceitação de convites
  const handleAcceptInvite = async (notification: Notification) => {
    if (notification.type === 'draft_invite' && notification.relatedId) {
      await acceptDraftInvite(notification.id, notification.relatedId)
      setOpen(false)
    }
  }

  // Função para lidar com a rejeição de convites
  const handleRejectInvite = async (notification: Notification) => {
    if (notification.type === 'draft_invite') {
      await rejectDraftInvite(notification.id)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center" 
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={5}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-medium">Notificações</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-2 text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => deleteNotification(notification.id)}
                        aria-label="Excluir notificação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Botões de ação para convites */}
                  {notification.type === 'draft_invite' && (
                    <div className="flex justify-end gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-3"
                        onClick={() => handleRejectInvite(notification)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Recusar
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 px-3"
                        onClick={() => handleAcceptInvite(notification)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Aceitar
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
} 