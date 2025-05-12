"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Character } from "@/types/character"
import type { Weapon } from "@/types/weapon"
import { useWeapons } from "@/hooks/use-weapons"
import WeaponSelector from "@/components/weapons/weapon-selector"
import { PlusCircle } from "lucide-react"
import Image from "next/image"

interface CharacterCardProps {
  character: Character
  onClick?: () => void
  showDetails?: boolean
}

export default function CharacterCard({ character, onClick, showDetails = false }: CharacterCardProps) {
  const { weapons, assignWeaponToCharacter } = useWeapons()
  const [isWeaponSelectorOpen, setIsWeaponSelectorOpen] = useState(false)

  // Encontrar a arma equipada pelo personagem
  const equippedWeapon = weapons.find((weapon) => weapon.id === character.equippedWeaponId)

  const handleSelectWeapon = (weapon: Weapon) => {
    assignWeaponToCharacter(weapon.id, character.id)
    setIsWeaponSelectorOpen(false)
  }

  // Renderizar constelações
  const renderConstellations = () => {
    return (
      <div className="flex gap-1 mt-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${index < character.constellation ? "bg-primary" : "bg-gray-600"}`}
          ></div>
        ))}
      </div>
    )
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
      <div className="aspect-square bg-gray-800 relative">
        {character.imagePath ? (
          <Image
            src={character.imagePath || "/placeholder.svg"}
            alt={character.name}
            width={300}
            height={300}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-700">
            {character.name.charAt(0)}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
            {character.element}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
            {character.rarity}★
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
          <div className="text-lg font-semibold truncate text-white">{character.name}</div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300">{character.tier}</div>
            <div className="text-sm text-gray-300">Lv.{character.level}</div>
          </div>
          {character.constellation > 0 && renderConstellations()}

          {/* Mostrar arma equipada */}
          {equippedWeapon && (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-5 w-5 bg-gray-800 rounded-full overflow-hidden">
                {equippedWeapon && equippedWeapon.imagePath ? (
                  <Image
                    src={equippedWeapon.imagePath || "/placeholder.svg"}
                    alt={equippedWeapon.name || "Arma equipada"}
                    width={20}
                    height={20}
                    className="object-contain w-full h-full p-0.5"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-xs text-gray-400">?</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-300 truncate">
                {equippedWeapon.name} (Lv.{equippedWeapon.level})
              </div>
            </div>
          )}
        </div>
      </div>
      {showDetails && (
        <CardContent className="p-3 space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Arma</div>
            {equippedWeapon ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-800 rounded-md overflow-hidden">
                  {equippedWeapon && equippedWeapon.imagePath ? (
                    <Image
                      src={equippedWeapon.imagePath || "/placeholder.svg"}
                      alt={equippedWeapon.name || "Arma equipada"}
                      width={32}
                      height={32}
                      className="object-contain w-full h-full p-1"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-xs text-gray-400">?</span>
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  {equippedWeapon.name} (Lv.{equippedWeapon.level})
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsWeaponSelectorOpen(true)
                }}
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Equipar Arma
              </Button>
            )}
          </div>
        </CardContent>
      )}

      <WeaponSelector
        open={isWeaponSelectorOpen}
        onOpenChange={setIsWeaponSelectorOpen}
        onSelect={handleSelectWeapon}
        weapons={weapons}
        characterWeaponType={character.weapon as any}
      />
    </Card>
  )
}
