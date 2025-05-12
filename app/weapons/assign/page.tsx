"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { ArrowLeft, Filter, Wind, Sun, Snowflake, Target, Flame, Zap } from "lucide-react"
import CharacterWeaponCard from "@/components/weapons/character-weapon-card"
import WeaponSelector from "@/components/weapons/weapon-selector"
import type { Character } from "@/types/character"
import type { Weapon, WeaponType } from "@/types/weapon"

export default function AssignWeaponsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { characters, isLoading: charactersLoading } = useCharacters()
  const { weapons, isLoading: weaponsLoading, assignWeaponToCharacter } = useWeapons()

  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [activeWeaponType, setActiveWeaponType] = useState<WeaponType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isWeaponSelectorOpen, setIsWeaponSelectorOpen] = useState(false)

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

  const elementIcons = {
    Aero: <Wind className="h-5 w-5 text-teal-400" />,
    Espectro: <Sun className="h-5 w-5 text-yellow-400" />,
    Glacio: <Snowflake className="h-5 w-5 text-blue-400" />,
    Devastação: <Target className="h-5 w-5 text-pink-400" />,
    Fusão: <Flame className="h-5 w-5 text-orange-400" />,
    Eletro: <Zap className="h-5 w-5 text-purple-400" />,
  }

  const filteredCharacters = characters.filter((character) => {
    // Filtrar por elemento se ativo
    if (activeElement && character.element !== activeElement) {
      return false
    }

    // Filtrar por tipo de arma se ativo
    if (activeWeaponType && character.weapon !== activeWeaponType) {
      return false
    }

    // Filtrar por termo de busca
    if (searchTerm && !character.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  const handleSelectWeapon = (weapon: Weapon) => {
    if (selectedCharacter) {
      assignWeaponToCharacter(weapon.id, selectedCharacter.id)
      setIsWeaponSelectorOpen(false)
    }
  }

  const getCharacterWeapon = (characterId: string) => {
    return weapons.find((weapon) => weapon.assignedTo === characterId) || null
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-6">Atribuir Armas aos Personagens</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar personagem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setActiveElement(null)
                  setActiveWeaponType(null)
                  setSearchTerm("")
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Filtrar por Elemento</div>
              <Tabs defaultValue="all" className="w-full">
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

            <div className="space-y-2">
              <div className="text-sm font-medium">Filtrar por Tipo de Arma</div>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-6">
                  <TabsTrigger value="all" onClick={() => setActiveWeaponType(null)}>
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="Espada" onClick={() => setActiveWeaponType("Espada")}>
                    Espada
                  </TabsTrigger>
                  <TabsTrigger value="Lâmina larga" onClick={() => setActiveWeaponType("Lâmina larga")}>
                    Lâmina larga
                  </TabsTrigger>
                  <TabsTrigger value="Manopla" onClick={() => setActiveWeaponType("Manopla")}>
                    Manopla
                  </TabsTrigger>
                  <TabsTrigger value="Retificador" onClick={() => setActiveWeaponType("Retificador")}>
                    Retificador
                  </TabsTrigger>
                  <TabsTrigger value="Pistola" onClick={() => setActiveWeaponType("Pistola")}>
                    Pistola
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredCharacters.map((character) => (
            <CharacterWeaponCard
              key={character.id}
              character={character}
              weapon={getCharacterWeapon(character.id)}
              onAssignWeapon={() => {
                setSelectedCharacter(character)
                setIsWeaponSelectorOpen(true)
              }}
            />
          ))}

          {filteredCharacters.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Nenhum personagem encontrado com os filtros atuais.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedCharacter && (
        <WeaponSelector
          open={isWeaponSelectorOpen}
          onOpenChange={setIsWeaponSelectorOpen}
          onSelect={handleSelectWeapon}
          weapons={weapons}
          characterWeaponType={selectedCharacter.weapon as WeaponType}
        />
      )}
    </DashboardLayout>
  )
}
