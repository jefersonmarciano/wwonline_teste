"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Character } from "@/types/character"
import { useWeapons } from "@/hooks/use-weapons"
import { Wind, Sun, Snowflake, Target, Flame, Zap, Filter } from "lucide-react"
import Image from "next/image"

interface CharacterGridProps {
  characters: Character[]
  onSelect: (character: Character) => void
  selectedCharacters: string[]
  isSelectable: boolean
}

export default function CharacterGrid({ characters, onSelect, selectedCharacters, isSelectable }: CharacterGridProps) {
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { weapons } = useWeapons()

  const elementIcons = {
    Aero: <Wind className="h-5 w-5 text-teal-400" />,
    Espectro: <Sun className="h-5 w-5 text-yellow-400" />,
    Glacio: <Snowflake className="h-5 w-5 text-blue-400" />,
    Devastação: <Target className="h-5 w-5 text-pink-400" />,
    Fusão: <Flame className="h-5 w-5 text-orange-400" />,
    Eletro: <Zap className="h-5 w-5 text-purple-400" />,
  }

  const filteredCharacters = characters.filter((character) => {
    // Filter by element if active
    if (activeElement && character.element !== activeElement) {
      return false
    }

    // Filter by search term
    if (searchTerm && !character.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  // Função para obter a arma equipada por um personagem
  const getEquippedWeapon = (characterId: string) => {
    return weapons.find((weapon) => weapon.assignedTo === characterId)
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Personagens</h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar personagem..."
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setActiveElement(null)
                setSearchTerm("")
              }}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-7">
              <TabsTrigger value="all" onClick={() => setActiveElement(null)}>
                Todos
              </TabsTrigger>
              {Object.entries(elementIcons).map(([element, icon]) => (
                <TabsTrigger
                  key={element}
                  value={element}
                  onClick={() => setActiveElement(element)}
                  className="flex items-center gap-1"
                >
                  {icon}
                  <span className="hidden sm:inline">{element}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {filteredCharacters.map((character) => {
            const isSelected = selectedCharacters.includes(character.id)
            const equippedWeapon = getEquippedWeapon(character.id)

            return (
              <div
                key={character.id}
                className={`relative rounded-md overflow-hidden cursor-pointer transition-all ${
                  isSelected ? "opacity-50" : ""
                } ${!isSelectable ? "pointer-events-none" : ""}`}
                onClick={() => !isSelected && isSelectable && onSelect(character)}
              >
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
                    <div className="flex items-center">
                      {elementIcons[character.element as keyof typeof elementIcons]}
                    </div>
                    <div className="text-xs font-bold">{character.rarity}★</div>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-1 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-xs font-medium truncate">{character.name}</div>
                    {character.constellation > 0 && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: character.constellation }).map((_, index) => (
                          <div key={index} className="w-1 h-1 bg-primary rounded-full"></div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mostrar ícone da arma equipada */}
                  {equippedWeapon && (
                    <div className="absolute top-0 right-0 p-1">
                      <div className="w-4 h-4 bg-black/60 rounded-full overflow-hidden">
                        {equippedWeapon && equippedWeapon.imagePath ? (
                          <Image
                            src={equippedWeapon.imagePath || "/placeholder.svg"}
                            alt={equippedWeapon.name || "Arma equipada"}
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
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
