"use client"

import type { Character } from "@/types/character"
import { useWeapons } from "@/hooks/use-weapons"
import Image from "next/image"

interface DraftTeamsProps {
  team1Picks: (Character | null)[]
  team2Picks: (Character | null)[]
}

export default function DraftTeams({ team1Picks, team2Picks }: DraftTeamsProps) {
  const { weapons } = useWeapons()

  // Função para obter a arma equipada por um personagem
  const getEquippedWeapon = (characterId: string) => {
    return weapons.find((weapon) => weapon.assignedTo === characterId)
  }

  const renderTeamGrid = (team: (Character | null)[]) => {
    return (
      <div className="grid grid-cols-4 gap-2">
        {team.map((character, index) => (
          <div
            key={index}
            className={`rounded-md overflow-hidden ${
              character ? (index % 2 === 0 ? "border-red-500" : "border-blue-500") : "border-gray-700"
            } border`}
          >
            {character ? (
              <div className="aspect-square bg-gray-700 relative">
                {character.imagePath && (
                  <Image
                    src={character.imagePath || "/placeholder.svg"}
                    alt={character.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                )}
                <div className="absolute top-0 left-0 w-full p-1 flex justify-between items-center">
                  <div className="text-xs font-bold">{character.rarity}★</div>
                  {character.constellation > 0 && <div className="text-xs font-bold">C{character.constellation}</div>}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-1 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-xs font-medium truncate">{character.name}</div>
                </div>

                {/* Mostrar ícone da arma equipada */}
                {getEquippedWeapon(character.id) && (
                  <div className="absolute top-0 right-0 p-1">
                    <div className="w-4 h-4 bg-black/60 rounded-full overflow-hidden">
                      {getEquippedWeapon(character.id)?.imagePath ? (
                        <Image
                          src={getEquippedWeapon(character.id)?.imagePath || "/placeholder.svg"}
                          alt={getEquippedWeapon(character.id)?.name || "Arma equipada"}
                          width={16}
                          height={16}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-[8px] text-gray-400">?</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-700 flex items-center justify-center text-gray-500">
                {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-center">Time 1</h3>
        {renderTeamGrid(team1Picks)}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-center">Time 2</h3>
        {renderTeamGrid(team2Picks)}
      </div>
    </div>
  )
}
