"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import MainLayout from "@/components/layouts/main-layout"
import { PlusCircle, Edit, Trash2, X, Shield } from "lucide-react"
import Link from "next/link"
import { useTeams } from "@/hooks/use-teams"
import { useCharacters } from "@/hooks/use-characters"
import Image from "next/image"
import CharacterSelector from "@/components/teams/character-selector"
import type { Character } from "@/types/character"
import type { Team, Deck } from "@/types/team"

// Mock weapons data (replace with actual data fetching)
const weapons = [
  { id: "weapon1", name: "Sword", imagePath: "/sword.png" },
  { id: "weapon2", name: "Axe", imagePath: "/axe.png" },
  { id: "weapon3", name: "Bow", imagePath: "/bow.png" },
]

import { Badge } from "@/components/ui/badge"

export default function TeamsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { teams, isLoading, addTeam, removeTeam, getDecks, getNormalTeams, calculateTeamCost } = useTeams()
  const { characters } = useCharacters()

  // Estados para o modal de criação de time
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([])
  const [isCharacterSelectorOpen, setIsCharacterSelectorOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("teams")
  const [isDeckCreation, setIsDeckCreation] = useState(false)

  // Estado para confirmação de exclusão
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Obter times normais e decks
  const normalTeams = getNormalTeams()
  const decks = getDecks()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleAddCharacter = (character: Character) => {
    if (!selectedCharacters.find((c) => c.id === character.id)) {
      // Limitar a 3 personagens por time normal ou 15+ para decks
      const maxChars = isDeckCreation ? 30 : 3
      if (selectedCharacters.length < maxChars) {
        setSelectedCharacters([...selectedCharacters, character])
      }
    }
    // Não fechamos mais o modal automaticamente
    // setIsCharacterSelectorOpen(false)
  }

  const handleRemoveCharacter = (characterId: string) => {
    setSelectedCharacters(selectedCharacters.filter((c) => c.id !== characterId))
  }

  const handleCreateTeam = async () => {
    if (teamName.trim() === "" || selectedCharacters.length === 0) {
      return
    }

    setIsSubmitting(true)

    try {
      // Calcular custo total
      const totalCost = calculateTeamCost(selectedCharacters.map((c) => c.id))

      // Verificar se é um deck válido
      if (isDeckCreation && selectedCharacters.length < 15) {
        alert("Um deck precisa ter pelo menos 15 personagens!")
        setIsSubmitting(false)
        return
      }

      // Criar novo time ou deck
      const newTeam: Team = {
        id: `${isDeckCreation ? "deck" : "team"}-${Date.now()}`,
        name: teamName,
        characters: selectedCharacters.map((c) => c.id),
        totalCost,
        isDeck: isDeckCreation,
        ...(isDeckCreation ? { deckCost: totalCost, minCharacters: 15 } : {}),
      }

      // Adicionar o time à lista
      await addTeam(newTeam)

      // Resetar o formulário
      setTeamName("")
      setSelectedCharacters([])
      setIsCreateTeamOpen(false)
      setIsDeckCreation(false)
    } catch (error) {
      console.error("Erro ao criar time:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return

    try {
      await removeTeam(teamToDelete)
      setIsDeleteDialogOpen(false)
      setTeamToDelete(null)
    } catch (error) {
      console.error("Erro ao excluir time:", error)
    }
  }

  const openDeleteDialog = (teamId: string) => {
    setTeamToDelete(teamId)
    setIsDeleteDialogOpen(true)
  }

  const openCreateModal = (isDeck = false) => {
    setIsDeckCreation(isDeck)
    setTeamName("")
    setSelectedCharacters([])
    setIsCreateTeamOpen(true)
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Função para renderizar um time
  const renderTeam = (team: Team) => {
    const teamCharacters = team.characters
      .map((id) => characters.find((c) => c.id === id))
      .filter(Boolean) as Character[]

    return (
      <Card key={team.id}>
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {teamCharacters.slice(0, 3).map((character, index) => (
              <div key={index} className="aspect-square bg-gray-800 rounded-md overflow-hidden relative">
                {character.imagePath ? (
                  <Image
                    src={character.imagePath || "/placeholder.svg"}
                    alt={character.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-600">
                    {character.name.charAt(0)}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60 text-xs truncate">{character.name}</div>

                {/* Mostrar arma equipada */}
                {character.equippedWeaponId && (
                  <div className="absolute top-1 right-1">
                    <div className="w-5 h-5 bg-black/60 rounded-full overflow-hidden">
                      {characters.find((c) => c.id === character.id)?.equippedWeaponId &&
                      weapons.find((w) => w.id === character.equippedWeaponId)?.imagePath ? (
                        <Image
                          src={
                            weapons.find((w) => w.id === character.equippedWeaponId)?.imagePath || "/placeholder.svg"
                          }
                          alt="Arma equipada"
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
                  </div>
                )}
              </div>
            ))}
            {teamCharacters.length < 3 &&
              Array.from({ length: 3 - teamCharacters.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="aspect-square bg-gray-800/50 rounded-md border border-dashed border-gray-700 flex items-center justify-center"
                >
                  <PlusCircle className="h-5 w-5 text-gray-600" />
                </div>
              ))}
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">
              {teamCharacters.length} personagens • Custo total: {team.totalCost}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/teams/${team.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(team.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Função para renderizar um deck
  const renderDeck = (deck: Deck) => {
    const deckCharacters = deck.characters
      .map((id) => characters.find((c) => c.id === id))
      .filter(Boolean) as Character[]

    return (
      <Card key={deck.id} className="border-2 border-yellow-600/50">
        <CardHeader className="bg-yellow-950/20">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-yellow-500" />
              {deck.name}
            </CardTitle>
            <Badge className="bg-yellow-600">{deckCharacters.length} personagens</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-5 gap-2">
            {deckCharacters.slice(0, 10).map((character, index) => (
              <div key={index} className="aspect-square bg-gray-800 rounded-md overflow-hidden relative">
                {character.imagePath ? (
                  <Image
                    src={character.imagePath || "/placeholder.svg"}
                    alt={character.name}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-600">
                    {character.name.charAt(0)}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                  <div className="text-xs text-white truncate">{character.name}</div>
                </div>

                {/* Mostrar arma equipada */}
                {character.equippedWeaponId && (
                  <div className="absolute top-1 right-1">
                    <div className="w-4 h-4 bg-black/60 rounded-full overflow-hidden">
                      {characters.find((c) => c.id === character.id)?.equippedWeaponId &&
                      weapons.find((w) => w.id === character.equippedWeaponId)?.imagePath ? (
                        <Image
                          src={
                            weapons.find((w) => w.id === character.equippedWeaponId)?.imagePath || "/placeholder.svg"
                          }
                          alt="Arma equipada"
                          width={16}
                          height={16}
                          className="object-contain w-full h-full p-0.5"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-gray-400">?</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {deckCharacters.length > 10 && (
              <div className="aspect-square bg-gray-800/50 rounded-md border border-dashed border-gray-700 flex items-center justify-center">
                <span className="text-sm text-gray-400">+{deckCharacters.length - 10}</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">Custo total: {deck.deckCost} • Deck para torneio</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/teams/${deck.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Deck
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(deck.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Equipes</h1>
          <div className="flex gap-2">
            <Button onClick={() => openCreateModal(false)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Equipe
            </Button>
            <Button onClick={() => openCreateModal(true)} variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Novo Deck
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="teams">Equipes ({normalTeams.length})</TabsTrigger>
            <TabsTrigger value="decks">Decks de Torneio ({decks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="teams" className="mt-4">
            {normalTeams.length === 0 ? (
              <div className="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-gray-400 mb-4">Você ainda não criou nenhuma equipe</p>
                <Button onClick={() => openCreateModal(false)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Equipe
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {normalTeams.map((team) => renderTeam(team))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="decks" className="mt-4">
            {decks.length === 0 ? (
              <div className="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-gray-400 mb-4">Você ainda não criou nenhum deck para torneios</p>
                <Button onClick={() => openCreateModal(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Criar Deck de Torneio
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {decks.map((deck) => renderDeck(deck))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Diálogo para criação de time */}
        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isDeckCreation ? "Criar Novo Deck" : "Criar Nova Equipe"}</DialogTitle>
              <DialogDescription>
                {isDeckCreation
                  ? "Crie um deck para uso em torneios"
                  : "Crie uma equipe para completar missões e desafios"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="team-name">Nome</Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={isDeckCreation ? "Nome do Deck" : "Nome da Equipe"}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>
                  {isDeckCreation ? (
                    <span>Personagens <span className="text-gray-400 text-sm">({selectedCharacters.length}/15 mínimo)</span></span>
                  ) : (
                    <span>Personagens <span className="text-gray-400 text-sm">({selectedCharacters.length}/3)</span></span>
                  )}
                </Label>
                
                <div className="flex flex-wrap gap-2 min-h-12 border p-2 rounded-md">
                  {selectedCharacters.length === 0 ? (
                    <div className="text-sm text-gray-400 flex-1 text-center py-2">
                      Selecione personagens para adicionar
                    </div>
                  ) : (
                    selectedCharacters.map((character) => (
                      <div
                        key={character.id}
                        className="flex items-center gap-1 bg-primary/20 rounded px-2 py-1"
                      >
                        <span className="text-sm">{character.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleRemoveCharacter(character.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setIsCharacterSelectorOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Personagem
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm">
                  <span className="font-medium">Custo Total:</span>{" "}
                  <span className="text-primary">{calculateTeamCost(selectedCharacters.map((c) => c.id))}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateTeam}
                    disabled={
                      teamName.trim() === "" ||
                      selectedCharacters.length === 0 ||
                      isSubmitting ||
                      (isDeckCreation && selectedCharacters.length < 15)
                    }
                  >
                    {isSubmitting ? "Criando..." : isDeckCreation ? "Criar Deck" : "Criar Equipe"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Seletor de personagens */}
        <Dialog open={isCharacterSelectorOpen} onOpenChange={setIsCharacterSelectorOpen}>
          <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Selecionar Personagens</DialogTitle>
              <DialogDescription>
                Clique nos personagens para adicioná-los à sua equipe
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <CharacterSelector
                onSelect={handleAddCharacter}
                selectedCharacters={selectedCharacters.map((c) => c.id)}
                maxSelection={isDeckCreation ? 30 : 3}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsCharacterSelectorOpen(false)}>
                Concluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de confirmação para exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteTeam}>
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
