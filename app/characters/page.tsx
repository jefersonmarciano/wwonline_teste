"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import CharacterCard from "@/components/characters/character-card"
import { Wind, Sun, Snowflake, Target, Flame, Zap, Filter } from "lucide-react"

export default function CharactersPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { characters, isLoading } = useCharacters()
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [activeRarity, setActiveRarity] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

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

    // Filter by rarity if active
    if (activeRarity && character.rarity !== activeRarity) {
      return false
    }

    // Filter by search term
    if (searchTerm && !character.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Personagens</h1>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Buscar personagem..."
              className="max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setActiveElement(null)
                setActiveRarity(null)
                setSearchTerm("")
              }}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium mb-2">Filtrar por Elemento</h2>
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

              <div>
                <h2 className="text-sm font-medium mb-2">Filtrar por Raridade</h2>
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
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCharacters.map((character) => (
            <CharacterCard key={character.id} character={character} elementIcons={elementIcons} />
          ))}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Nenhum personagem encontrado</h2>
            <p className="text-muted-foreground">Tente ajustar os filtros ou a busca</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
