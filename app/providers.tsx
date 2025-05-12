"use client"

import type React from "react"
import { Suspense } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { DraftProvider } from "@/hooks/use-draft"
import { CostsProvider } from "@/hooks/use-costs"
import { FriendsProvider } from "@/hooks/use-friends"
import { NotificationsProvider } from "@/hooks/use-notifications"
import { NotificationPanel } from "@/components/notifications/notification-panel"
import { DraftInviteModal } from "@/components/notifications/draft-invite-modal"
import { Toaster } from "@/components/ui/toast"

// Componente de fallback simples para o Suspense
function AuthLoading() {
  return <div className="bg-background min-h-screen"></div>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <Suspense fallback={<AuthLoading />}>
        <AuthProvider>
          <CostsProvider>
            <FriendsProvider>
              <NotificationsProvider>
                <DraftProvider>
                  {children}
                  
                  {/* Componentes de notificação */}
                  <NotificationTray />
                </DraftProvider>
              </NotificationsProvider>
            </FriendsProvider>
          </CostsProvider>
        </AuthProvider>
      </Suspense>
    </ThemeProvider>
  )
}

// Componente que renderiza os componentes de notificação
function NotificationTray() {
  return (
    <>
      <div className="fixed right-4 bottom-4 z-50">
        <NotificationPanel />
      </div>
      <DraftInviteModal />
      <Toaster />
    </>
  )
}
