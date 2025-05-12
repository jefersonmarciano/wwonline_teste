"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Wind, Sun, Snowflake, Target, Flame, Zap, Filter, PlusCircle } from "lucide-react"
import Image from "next/image"
import WeaponSelector from "@/components/weapons/weapon-selector"
import type { Weapon } from "@/types/weapon"

export default function CollectionPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const {
    characters,
    isLoading: charactersLoading,
    updateCharacterOwnership,
    updateCharacterConstellation,
    updateCharacterLevel,
    equipWeaponToCharacter,
  } = useCharacters()
  const {
    weapons,
    isLoading: weaponsLoading,
    updateWeaponRefinement,
    updateWeaponLevel,
    assignWeaponToCharacter,
    getWeaponById,
  } = useWeapons()

  const [activeTab, setActiveTab] = useState("characters")
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [activeWeaponType, setActiveWeaponType] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)
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

  // Filtrar personagens
  const filteredCharacters = characters.filter((character) => {
    // Filtrar por posse
    if (showOnlyOwned && !character.owned) {
      return false
    }

    // Filtrar por elemento se ativo
    if (activeElement && character.element !== activeElement) {
      return false
    }

    // Filtrar por termo de busca
    if (searchTerm && !character.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  // Filtrar armas
  const filteredWeapons = weapons.filter((weapon) => {
    // Filtrar por tipo de arma se ativo
    if (activeWeaponType && weapon.type !== activeWeaponType) {
      return false
    }

    // Filtrar por termo de busca
    if (searchTerm && !weapon.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  // Estatísticas da coleção
  const ownedCharacters = characters.filter((char) => char.owned).length
  const totalCharacters = characters.length
  const ownedWeapons = weapons.length
  const charactersWithConstellations = characters.filter((char) => char.owned && char.constellation > 0).length
  const weaponsWithRefinements = weapons.filter((weapon) => weapon.refinement > 1).length

  // Função para obter a arma equipada por um personagem
  const getEquippedWeapon = (characterId: string) => {
    const character = characters.find((c) => c.id === characterId)
    if (character?.equippedWeaponId) {
      return getWeaponById(character.equippedWeaponId)
    }
    return null
  }

  const handleSelectWeapon = (weapon: Weapon) => {
    if (selectedCharacterId) {
      // Atualizar a arma no personagem
      equipWeaponToCharacter(selectedCharacterId, weapon.id)

      // Atualizar a arma para mostrar que está atribuída ao personagem
      assignWeaponToCharacter(weapon.id, selectedCharacterId)

      setIsWeaponSelectorOpen(false)
      setSelectedCharacterId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Minha Coleção</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Personagens Obtidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ownedCharacters}/{totalCharacters}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Armas 5★</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ownedWeapons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Personagens com Constelações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{charactersWithConstellations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Armas com Refinamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weaponsWithRefinements}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={`Buscar ${activeTab === "characters" ? "personagem" : "arma"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab === "characters" && (
                <div className="flex items-center space-x-2">
                  <Switch id="show-owned" checked={showOnlyOwned} onCheckedChange={setShowOnlyOwned} />
                  <Label htmlFor="show-owned">Mostrar apenas obtidos</Label>
                </div>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setActiveElement(null)
                  setActiveWeaponType(null)
                  setSearchTerm("")
                  setShowOnlyOwned(false)
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {activeTab === "characters" && (
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
            )}

            {activeTab === "weapons" && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Filtrar por Tipo</div>
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
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="characters" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="characters">Personagens</TabsTrigger>
              <TabsTrigger value="weapons">Armas</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="characters" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCharacters.map((character) => (
                <Card key={character.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-800 relative">
                    {character.imagePath ? (
                      <Image
                        src={character.imagePath || "/placeholder.svg"}
                        alt={character.name}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-700">
                        {character.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                        {elementIcons[character.element as keyof typeof elementIcons]}
                        <span className="text-xs">{character.element}</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
                        {character.rarity}★
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
                      <div className="text-lg font-semibold truncate text-white">{character.name}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-300">{character.tier}</div>
                        <div className="text-sm text-gray-300">{character.weapon}</div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`owned-${character.id}`}>Obtido</Label>
                      <Switch
                        id={`owned-${character.id}`}
                        checked={character.owned}
                        onCheckedChange={(checked) => updateCharacterOwnership(character.id, checked)}
                      />
                    </div>

                    {character.owned && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Nível ({character.level}/90)</Label>
                            <span className="text-sm">{character.level}</span>
                          </div>
                          <Slider
                            min={1}
                            max={90}
                            step={1}
                            value={[character.level]}
                            onValueChange={(value) => updateCharacterLevel(character.id, value[0])}
                          />
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">1</span>
                            <span className="text-xs text-muted-foreground">90</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Constelações ({character.constellation}/5)</Label>
                            <span className="text-sm">{character.constellation}</span>
                          </div>
                          <Slider
                            min={0}
                            max={5}
                            step={1}
                            value={[character.constellation]}
                            onValueChange={(value) => updateCharacterConstellation(character.id, value[0])}
                          />
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">0</span>
                            <span className="text-xs text-muted-foreground">5</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="block mb-2">Arma Equipada</Label>
                          {getEquippedWeapon(character.id) ? (
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 bg-gray-800 rounded-md overflow-hidden">
                                <Image
                                  src={getEquippedWeapon(character.id)?.imagePath || "/placeholder.svg"}
                                  alt={getEquippedWeapon(character.id)?.name || ""}
                                  width={48}
                                  height={48}
                                  className="object-contain w-full h-full p-1"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{getEquippedWeapon(character.id)?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {getEquippedWeapon(character.id)?.rarity}★ | Nível{" "}
                                  {getEquippedWeapon(character.id)?.level}
                                  {getEquippedWeapon(character.id)?.refinement &&
                                    getEquippedWeapon(character.id)?.refinement > 1 &&
                                    ` | R${getEquippedWeapon(character.id)?.refinement}`}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (getEquippedWeapon(character.id)) {
                                    // Remover a arma do personagem
                                    assignWeaponToCharacter(getEquippedWeapon(character.id)!.id, null)
                                    equipWeaponToCharacter(character.id, null)
                                  }
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                setSelectedCharacterId(character.id)
                                setIsWeaponSelectorOpen(true)
                              }}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Equipar Arma
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredCharacters.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhum personagem encontrado com os filtros atuais.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="weapons" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredWeapons.map((weapon) => (
                <Card key={weapon.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-800 relative">
                    <Image
                      src={weapon.imagePath || "/placeholder.svg"}
                      alt={weapon.name}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full p-2"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md text-xs">{weapon.rarity}★</div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
                      <div className="text-lg font-semibold truncate text-white">{weapon.name}</div>
                      <div className="text-sm text-gray-300">{weapon.type}</div>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Nível ({weapon.level}/90)</Label>
                        <span className="text-sm">{weapon.level}</span>
                      </div>
                      <Slider
                        min={1}
                        max={90}
                        step={1}
                        value={[weapon.level]}
                        onValueChange={(value) => updateWeaponLevel(weapon.id, value[0])}
                      />
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">1</span>
                        <span className="text-xs text-muted-foreground">90</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Refinamento ({weapon.refinement}/5)</Label>
                        <span className="text-sm">{weapon.refinement}</span>
                      </div>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[weapon.refinement]}
                        onValueChange={(value) => updateWeaponRefinement(weapon.id, value[0])}
                      />
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">1</span>
                        <span className="text-xs text-muted-foreground">5</span>
                      </div>
                    </div>

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

                    {weapon.assignedTo && (
                      <div className="mt-2">
                        <Label className="block mb-2">Equipada por</Label>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gray-800 rounded-full overflow-hidden">
                            {characters.find((c) => c.id === weapon.assignedTo)?.imagePath && (
                              <Image
                                src={
                                  characters.find((c) => c.id === weapon.assignedTo)?.imagePath || "/placeholder.svg"
                                }
                                alt={characters.find((c) => c.id === weapon.assignedTo)?.name || ""}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <span className="text-sm">{characters.find((c) => c.id === weapon.assignedTo)?.name}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredWeapons.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhuma arma encontrada com os filtros atuais.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedCharacterId && (
        <WeaponSelector
          open={isWeaponSelectorOpen}
          onOpenChange={setIsWeaponSelectorOpen}
          onSelect={handleSelectWeapon}
          weapons={weapons}
          characterWeaponType={characters.find((char) => char.id === selectedCharacterId)?.weapon as any}
        />
      )}
    </DashboardLayout>
  )
}
