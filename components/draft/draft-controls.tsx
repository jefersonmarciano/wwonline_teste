"use client"

import { Button } from "@/components/ui/button"
import { Ban, SkipForward } from "lucide-react"

interface DraftControlsProps {
  onBan: () => void
  onSkip: () => void
  isPlayerTurn: boolean
  currentPhase: string
}

export default function DraftControls({ onBan, onSkip, isPlayerTurn, currentPhase }: DraftControlsProps) {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="text-sm">{isPlayerTurn ? "Sua vez: Selecione um personagem" : "Aguardando o oponente..."}</div>

        <div className="flex gap-2">
          {currentPhase === "Ban Phase" && (
            <Button variant="destructive" onClick={onBan} disabled={!isPlayerTurn}>
              <Ban className="h-4 w-4 mr-2" />
              Banir
            </Button>
          )}

          <Button variant="outline" onClick={onSkip} disabled={!isPlayerTurn}>
            <SkipForward className="h-4 w-4 mr-2" />
            Pular
          </Button>
        </div>
      </div>
    </div>
  )
}
