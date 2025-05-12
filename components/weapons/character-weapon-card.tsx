"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Character } from "@/types/character"
import type { Weapon } from "@/types/weapon"
import { PlusCircle } from "lucide-react"
import Image from "next/image"

interface CharacterWeaponCardProps {
  character: Character
  weapon: Weapon | null
  onAssignWeapon: () => void
}

export default function CharacterWeaponCard({ character, weapon, onAssignWeapon }: CharacterWeaponCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Personagem */}
        <div className="p-4 border-r border-border">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-800">
              {character.imagePath ? (
                <Image
                  src={character.imagePath || "/placeholder.svg"}
                  alt={character.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-600">
                  {character.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{character.name}</h3>
              <div className="text-sm text-muted-foreground">
                {character.rarity}★ | {character.element} | {character.weapon}
              </div>
            </div>
          </div>
        </div>

        {/* Arma */}
        <div className="p-4">
          <div className="flex flex-col h-full">
            <h4 className="text-sm font-medium mb-2">Arma Equipada</h4>
            {weapon ? (
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-800">
                  <Image
                    src={weapon.imagePath || "/placeholder.svg"}
                    alt={weapon.name}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full p-1"
                  />
                </div>
                <div>
                  <div className="font-medium">{weapon.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {weapon.rarity}★ | {weapon.type}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="h-16 border-dashed flex flex-col items-center justify-center"
                onClick={onAssignWeapon}
              >
                <PlusCircle className="h-5 w-5 mb-1" />
                <span className="text-xs">Atribuir Arma</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
