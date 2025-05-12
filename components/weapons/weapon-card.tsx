"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Weapon } from "@/types/weapon"
import Image from "next/image"

interface WeaponCardProps {
  weapon: Weapon
  onClick?: () => void
  isAssigned?: boolean
  showDetails?: boolean
}

export default function WeaponCard({ weapon, onClick, isAssigned = false, showDetails = false }: WeaponCardProps) {
  const rarityStars = "★".repeat(weapon.rarity)

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${
        isAssigned ? "border-primary" : "hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <div className="aspect-square bg-gray-800 relative">
        <Image
          src={weapon.imagePath || "/placeholder.svg"}
          alt={weapon.name}
          width={200}
          height={200}
          className="object-contain w-full h-full p-2"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
            {rarityStars}
          </Badge>
        </div>
        {isAssigned && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary">Equipada</Badge>
          </div>
        )}
        {weapon.refinement > 1 && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
              R{weapon.refinement}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black to-transparent">
          <div className="text-sm font-semibold truncate text-white">{weapon.name}</div>
          <div className="text-xs text-gray-300">{weapon.type}</div>
        </div>
      </div>
      {showDetails && (
        <CardContent className="p-3 space-y-2">
          {weapon.stats && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">ATK</span>
                <span className="text-xs font-medium">{weapon.stats.attack}</span>
              </div>
              {weapon.stats.critRate && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Taxa Crítica</span>
                  <span className="text-xs font-medium">{weapon.stats.critRate}%</span>
                </div>
              )}
              {weapon.stats.critDamage && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Dano Crítico</span>
                  <span className="text-xs font-medium">{weapon.stats.critDamage}%</span>
                </div>
              )}
              {weapon.stats.elementalDamage && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Dano Elemental</span>
                  <span className="text-xs font-medium">{weapon.stats.elementalDamage}%</span>
                </div>
              )}
            </div>
          )}
          {weapon.passive && (
            <div>
              <span className="text-xs text-muted-foreground block">Passiva:</span>
              <span className="text-xs">{weapon.passive}</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
