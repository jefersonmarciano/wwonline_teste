"use client"

import { useEffect, useState } from "react"
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import { CheckCircle, XCircle, Gamepad2 } from "lucide-react"

export function DraftInviteModal() {
  const { 
    notifications, 
    acceptDraftInvite, 
    rejectDraftInvite,
    markAsRead 
  } = useNotifications()
  const [open, setOpen] = useState(false)
  const [currentInvite, setCurrentInvite] = useState<Notification | null>(null)

  // Verificar se há novos convites quando as notificações mudarem
  useEffect(() => {
    const draftInvites = notifications.filter(
      n => n.type === 'draft_invite' && !n.read
    )
    
    if (draftInvites.length > 0 && !open) {
      // Mostrar o convite mais recente
      setCurrentInvite(draftInvites[0])
      setOpen(true)
    }
  }, [notifications, open])

  // Fechar o modal e marcar como lido
  const handleClose = async () => {
    if (currentInvite) {
      await markAsRead(currentInvite.id)
    }
    setOpen(false)
    setCurrentInvite(null)
  }

  // Aceitar convite
  const handleAccept = async () => {
    if (currentInvite && currentInvite.relatedId) {
      await acceptDraftInvite(currentInvite.id, currentInvite.relatedId)
      setOpen(false)
      setCurrentInvite(null)
    }
  }

  // Rejeitar convite
  const handleReject = async () => {
    if (currentInvite) {
      await rejectDraftInvite(currentInvite.id)
      setOpen(false)
      setCurrentInvite(null)
    }
  }

  if (!currentInvite) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <Gamepad2 className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Convite para Draft
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center mb-4">
            {currentInvite.message}
          </p>
        </div>
        
        <DialogFooter className="flex sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleReject}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Recusar
          </Button>
          <Button
            className="flex-1"
            onClick={handleAccept}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Aceitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 