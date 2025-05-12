"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useCosts } from "@/hooks/use-costs"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import { InfoIcon } from "lucide-react"

interface DraftScoreDisplayProps {
  characterIds: string[]
}

export function DraftScoreDisplay({ characterIds }: DraftScoreDisplayProps) {
  const { characters } = useCharacters()
  const { weapons } = useWeapons()
  const { calculateCharacterCost, calculateWeaponCost, draftRules } = useCosts()

  // Filtrar personagens selecionados
  const selectedCharacters = useMemo(() => {
    return characters.filter((char) => characterIds.includes(char.id))
  }, [characters, characterIds])

  // Obter armas equipadas pelos personagens
  const equippedWeapons = useMemo(() => {
    return weapons.filter((weapon) => selectedCharacters.some((char) => char.equippedWeaponId === weapon.id))
  }, [weapons, selectedCharacters])

  // Calcular pontuação total de personagens
  const characterScore = useMemo(() => {
    return selectedCharacters.reduce((total, char) => {
      return total + calculateCharacterCost(char)
    }, 0)
  }, [selectedCharacters, calculateCharacterCost])

  // Calcular pontuação total de armas
  const weaponScore = useMemo(() => {
    return equippedWeapons.reduce((total, weapon) => {
      return total + calculateWeaponCost(weapon)
    }, 0)
  }, [equippedWeapons, calculateWeaponCost])

  // Pontuação total
  const totalScore = characterScore + weaponScore

  // Porcentagem do limite máximo
  const percentOfMax = Math.min(100, (totalScore / draftRules.maxPoints) * 100)

  // Porcentagem do limite de armas
  const weaponPercentOfMax = Math.min(100, (weaponScore / draftRules.maxWeaponPoints) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pontuação do Draft</span>
          <Badge variant={percentOfMax >= 100 ? "destructive" : "outline"}>
            {totalScore} / {draftRules.maxPoints}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Progresso Total</span>
            <span className="text-sm">{Math.round(percentOfMax)}%</span>
          </div>
          <Progress value={percentOfMax} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Personagens</span>
              <span className="text-sm">{characterScore}</span>
            </div>
            <Progress value={(characterScore / totalScore) * 100} className="h-2 bg-blue-900">
              <div className="h-full bg-blue-500 transition-all" />
            </Progress>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Armas</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    <span className="text-sm">{weaponScore}</span>
                    <InfoIcon className="h-3 w-3 ml-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Limite de pontos para armas: {draftRules.maxWeaponPoints}</p>
                    <Progress value={weaponPercentOfMax} className="h-2 mt-2" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Progress value={(weaponScore / totalScore) * 100} className="h-2 bg-amber-900">
              <div className="h-full bg-amber-500 transition-all" />
            </Progress>
          </div>
        </div>

        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-2">Detalhamento</h4>
          <div className="space-y-1 text-xs">
            {selectedCharacters.map((char) => {
              const charCost = calculateCharacterCost(char)
              const equippedWeapon = weapons.find((w) => w.id === char.equippedWeaponId)
              const weaponCost = equippedWeapon ? calculateWeaponCost(equippedWeapon) : 0

              return (
                <div key={char.id} className="flex justify-between">
                  <span>
                    {char.name} (C{char.constellation})
                    {equippedWeapon && ` + ${equippedWeapon.name} (R${equippedWeapon.refinement})`}
                  </span>
                  <span>{charCost + weaponCost}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
