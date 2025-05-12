"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import type { Weapon, WeaponType } from "@/types/weapon"
import { Filter } from "lucide-react"
import WeaponCard from "./weapon-card"

interface WeaponSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (weapon: Weapon) => void
  weapons: Weapon[]
  characterWeaponType: WeaponType
}

export default function WeaponSelector({
  open,
  onOpenChange,
  onSelect,
  weapons,
  characterWeaponType,
}: WeaponSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeRarity, setActiveRarity] = useState<number | null>(null)

  // Filtrar armas pelo tipo do personagem
  const compatibleWeapons = weapons.filter((weapon) => weapon.type === characterWeaponType)

  const filteredWeapons = compatibleWeapons.filter((weapon) => {
    // Filtrar por raridade se ativa
    if (activeRarity && weapon.rarity !== activeRarity) {
      return false
    }

    // Filtrar por termo de busca
    if (searchTerm && !weapon.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar Arma ({characterWeaponType})</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar arma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setActiveRarity(null)
                setSearchTerm("")
              }}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Filtrar por Raridade</div>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all" onClick={() => setActiveRarity(null)}>
                  Todos
                </TabsTrigger>
                <TabsTrigger value="5" onClick={() => setActiveRarity(5)}>
                  5★
                </TabsTrigger>
                <TabsTrigger value="4" onClick={() => setActiveRarity(4)}>
                  4★
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
            {filteredWeapons.map((weapon) => (
              <WeaponCard
                key={weapon.id}
                weapon={weapon}
                onClick={() => onSelect(weapon)}
                isAssigned={weapon.assignedTo !== null}
              />
            ))}

            {filteredWeapons.length === 0 && (
              <div className="col-span-full text-center py-4 text-muted-foreground">
                Nenhuma arma compatível encontrada com os filtros atuais
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
