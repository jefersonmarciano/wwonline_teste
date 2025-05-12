"use client"

import { Card } from "@/components/ui/card"
import type { Character } from "@/types/character"
import CharacterGrid from "./character-grid"
import DraftTeams from "./draft-teams"

interface DraftPickPhaseProps {
  team1Picks: (Character | null)[]
  team2Picks: (Character | null)[]
  onSelectCharacter: (character: Character) => void
  isPlayerTurn: boolean
  characters: Character[]
  currentTurn: "player1" | "player2"
}

export default function DraftPickPhase({
  team1Picks,
  team2Picks,
  onSelectCharacter,
  isPlayerTurn,
  characters,
  currentTurn,
}: DraftPickPhaseProps) {
  return (
    <div className="flex-1 flex flex-col p-4">
      <Card className="bg-gray-800/50 border-gray-700 mb-4">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Fase de Pick</h2>
          <DraftTeams team1Picks={team1Picks} team2Picks={team2Picks} />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isPlayerTurn
              ? "Sua vez: Selecione um personagem para o seu time"
              : "Aguardando o oponente selecionar um personagem"}
          </div>
        </div>
      </Card>

      <div className="flex-1">
        <CharacterGrid
          characters={characters}
          onSelect={onSelectCharacter}
          selectedCharacters={[
            ...team1Picks.filter(Boolean).map((p) => p!.id),
            ...team2Picks.filter(Boolean).map((p) => p!.id),
          ]}
          isSelectable={isPlayerTurn}
        />
      </div>
    </div>
  )
}
