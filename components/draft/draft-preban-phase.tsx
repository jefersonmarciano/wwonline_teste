"use client"

import { Card } from "@/components/ui/card"
import type { Character } from "@/types/character"
import CharacterGrid from "./character-grid"

interface DraftPrebanPhaseProps {
  prebans: (Character | null)[]
  onSelectCharacter: (character: Character) => void
  isPlayerTurn: boolean
  characters: Character[]
}

export default function DraftPrebanPhase({
  prebans,
  onSelectCharacter,
  isPlayerTurn,
  characters,
}: DraftPrebanPhaseProps) {
  return (
    <div className="flex-1 flex flex-col p-4">
      <Card className="bg-gray-800/50 border-gray-700 mb-4">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Fase de Pré-Ban</h2>
          <div className="flex justify-center gap-4">
            {prebans.map((preban, index) => (
              <div
                key={index}
                className={`w-20 h-20 rounded-md overflow-hidden border ${
                  preban ? "border-purple-500" : "border-gray-700"
                }`}
              >
                {preban ? (
                  <div className="w-full h-full bg-gray-700 relative">
                    <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60 text-xs truncate">
                      {preban.name}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                    {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isPlayerTurn
              ? "Sua vez: Selecione um personagem para banir"
              : "Aguardando o oponente selecionar um personagem para banir"}
          </div>
        </div>
      </Card>

      <div className="flex-1">
        <CharacterGrid
          characters={characters}
          onSelect={onSelectCharacter}
          selectedCharacters={prebans.filter(Boolean).map((p) => p!.id)}
          isSelectable={isPlayerTurn}
        />
      </div>
    </div>
  )
}
