"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Copy, Share2 } from "lucide-react"

interface DraftLayoutProps {
  children: React.ReactNode
}

export default function DraftLayout({ children }: DraftLayoutProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Sala de Draft</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={copyInviteLink}>
              {copied ? (
                <>Copiado!</>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>

            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>

            <div className="text-sm">
              Logado como <span className="font-semibold">{user?.name || "Usuário"}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto">{children}</main>
    </div>
  )
}
