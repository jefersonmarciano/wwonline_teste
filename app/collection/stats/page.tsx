"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { ArrowLeft, Wind, Sun, Snowflake, Target, Flame, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function CollectionStatsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { characters, isLoading: charactersLoading } = useCharacters()
  const { weapons, isLoading: weaponsLoading } = useWeapons()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || charactersLoading || weaponsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Estatísticas gerais
  const totalCharacters = characters.length
  const ownedCharacters = characters.filter((char) => char.owned).length
  const ownedPercentage = Math.round((ownedCharacters / totalCharacters) * 100)

  const fiveStarCharacters = characters.filter((char) => char.rarity === 5).length
  const ownedFiveStarCharacters = characters.filter((char) => char.owned && char.rarity === 5).length
  const fiveStarPercentage = Math.round((ownedFiveStarCharacters / fiveStarCharacters) * 100)

  const fourStarCharacters = characters.filter((char) => char.rarity === 4).length
  const ownedFourStarCharacters = characters.filter((char) => char.owned && char.rarity === 4).length
  const fourStarPercentage = Math.round((ownedFourStarCharacters / fourStarCharacters) * 100)

  // Estatísticas de constelações
  const totalConstellations = ownedCharacters * 5
  const unlockedConstellations = characters.reduce((total, char) => total + (char.owned ? char.constellation : 0), 0)
  const constellationPercentage = Math.round((unlockedConstellations / totalConstellations) * 100) || 0

  // Estatísticas de refinamento
  const totalRefinements = weapons.length * 4 // Máximo de 5 refinamentos, então 4 níveis acima do básico
  const unlockedRefinements = weapons.reduce((total, weapon) => total + (weapon.refinement - 1), 0)
  const refinementPercentage = Math.round((unlockedRefinements / totalRefinements) * 100) || 0

  // Estatísticas por elemento
  const elementIcons = {
    Aero: <Wind className="h-5 w-5 text-teal-400" />,
    Espectro: <Sun className="h-5 w-5 text-yellow-400" />,
    Glacio: <Snowflake className="h-5 w-5 text-blue-400" />,
    Devastação: <Target className="h-5 w-5 text-pink-400" />,
    Fusão: <Flame className="h-5 w-5 text-orange-400" />,
    Eletro: <Zap className="h-5 w-5 text-purple-400" />,
  }

  const elementStats = Object.keys(elementIcons).map((element) => {
    const totalByElement = characters.filter((char) => char.element === element).length
    const ownedByElement = characters.filter((char) => char.owned && char.element === element).length
    const percentage = Math.round((ownedByElement / totalByElement) * 100) || 0

    return {
      element,
      total: totalByElement,
      owned: ownedByElement,
      percentage,
    }
  })

  // Estatísticas por tipo de arma
  const weaponTypes = ["Espada", "Lâmina larga", "Manopla", "Retificador", "Pistola"]
  const weaponStats = weaponTypes.map((type) => {
    const totalByType = weapons.filter((weapon) => weapon.type === type).length
    const refinedByType = weapons.filter((weapon) => weapon.type === type && weapon.refinement > 1).length
    const assignedByType = weapons.filter((weapon) => weapon.type === type && weapon.assignedTo).length

    return {
      type,
      total: totalByType,
      refined: refinedByType,
      assigned: assignedByType,
    }
  })

  return (
    <DashboardLayout>
      <div className="p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-6">Estatísticas da Coleção</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progresso da Coleção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{ownedPercentage}%</div>
              <Progress value={ownedPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {ownedCharacters} de {totalCharacters} personagens obtidos
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progresso de Constelações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{constellationPercentage}%</div>
              <Progress value={constellationPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {unlockedConstellations} de {totalConstellations} constelações desbloqueadas
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progresso de Refinamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{refinementPercentage}%</div>
              <Progress value={refinementPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {unlockedRefinements} de {totalRefinements} refinamentos desbloqueados
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4">Personagens por Raridade</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Personagens 5★</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{fiveStarPercentage}%</div>
              <Progress value={fiveStarPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {ownedFiveStarCharacters} de {fiveStarCharacters} personagens 5★ obtidos
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Personagens 4★</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{fourStarPercentage}%</div>
              <Progress value={fourStarPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {ownedFourStarCharacters} de {fourStarCharacters} personagens 4★ obtidos
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4">Personagens por Elemento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {elementStats.map((stat) => (
            <Card key={stat.element}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {elementIcons[stat.element as keyof typeof elementIcons]}
                  {stat.element}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{stat.percentage}%</div>
                <Progress value={stat.percentage} className="h-2" />
                <div className="text-sm text-muted-foreground mt-2">
                  {stat.owned} de {stat.total} personagens obtidos
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4">Armas por Tipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weaponStats.map((stat) => (
            <Card key={stat.type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stat.type}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total</span>
                      <span>{stat.total}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Refinadas</span>
                      <span>{stat.refined}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Equipadas</span>
                      <span>{stat.assigned}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
