"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Weapon } from "@/types/weapon"

interface WeaponSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (weapon: Weapon) => void
  weapons: Weapon[]
  selectedWeapons: string[]
}

export default function WeaponSelector({
  open,
  onOpenChange,
  onSelect,
  weapons,
  selectedWeapons,
}: WeaponSelectorProps) {
  const [filter, setFilter] = useState<string | null>(null)

  const filteredWeapons = weapons.filter((weapon) => {
    if (filter && weapon.type !== filter) {
      return false
    }
    return true
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Arma</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant={filter === null ? "default" : "outline"} size="sm" onClick={() => setFilter(null)}>
              Todas
            </Button>
            {["Espada", "Lâmina larga", "Manopla", "Retificador", "Pistola"].map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {filteredWeapons.map((weapon) => {
              const isSelected = selectedWeapons.includes(weapon.id)

              return (
                <div
                  key={weapon.id}
                  className={`p-2 border rounded-md cursor-pointer ${
                    isSelected ? "border-primary bg-primary/10" : "border-gray-700"
                  }`}
                  onClick={() => !isSelected && onSelect(weapon)}
                >
                  <div className="text-sm font-medium">{weapon.name}</div>
                  <div className="text-xs text-gray-400">{weapon.type}</div>
                  <div className="text-xs mt-1">
                    {weapon.rarity}★ | Custo: {weapon.cost}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
