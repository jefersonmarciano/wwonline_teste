"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { DraftProvider } from "@/hooks/use-draft"
import { CostsProvider } from "@/hooks/use-costs"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <CostsProvider>
          <DraftProvider>{children}</DraftProvider>
        </CostsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
