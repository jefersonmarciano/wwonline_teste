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
import DashboardLayout from "@/components/layouts/dashboard-layout"
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
    <DashboardLayout>
      <div className="p-6">
        <Tabs defaultValue="teams" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Meus Times</h1>
              <TabsList>
                <TabsTrigger value="teams">Times</TabsTrigger>
                <TabsTrigger value="decks">Decks de Torneio</TabsTrigger>
              </TabsList>
            </div>

            {activeTab === "teams" ? (
              <Button onClick={() => openCreateModal(false)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar Novo Time
              </Button>
            ) : (
              <Button onClick={() => openCreateModal(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar Novo Deck
              </Button>
            )}
          </div>

          <TabsContent value="teams">
            {normalTeams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <div className="mb-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <PlusCircle className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Nenhum time criado</h2>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro time para participar de drafts e torneios
                  </p>
                  <Button onClick={() => openCreateModal(false)}>Criar Time</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {normalTeams.map((team) => renderTeam(team))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="decks">
            {decks.length === 0 ? (
              <Card className="border-dashed border-yellow-600/50">
                <CardContent className="pt-6 text-center">
                  <div className="mb-4">
                    <div className="h-20 w-20 rounded-full bg-yellow-600/10 flex items-center justify-center mx-auto">
                      <Shield className="h-10 w-10 text-yellow-600" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Nenhum deck de torneio criado</h2>
                  <p className="text-muted-foreground mb-4">
                    Crie um deck com pelo menos 15 personagens para participar de torneios oficiais
                  </p>
                  <Button onClick={() => openCreateModal(true)} className="bg-yellow-600 hover:bg-yellow-700">
                    Criar Deck de Torneio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{decks.map((deck) => renderDeck(deck))}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de criação de time/deck */}
      <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isDeckCreation ? "Criar Novo Deck de Torneio" : "Criar Novo Time"}</DialogTitle>
            <DialogDescription>
              {isDeckCreation
                ? "Crie um novo deck com pelo menos 15 personagens para participar de torneios oficiais."
                : "Crie um novo time com até 3 personagens para participar de drafts e torneios."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">{isDeckCreation ? "Nome do Deck" : "Nome do Time"}</Label>
              <Input
                id="teamName"
                placeholder={isDeckCreation ? "Ex: Deck Principal" : "Ex: Time Principal"}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                {isDeckCreation
                  ? `Personagens (Mínimo: 15, Selecionados: ${selectedCharacters.length})`
                  : "Personagens (Máximo: 3)"}
              </Label>

              {/* Mostrar apenas alguns personagens selecionados para economizar espaço */}
              <div className="grid grid-cols-5 gap-2">
                {selectedCharacters.slice(0, 5).map((character) => (
                  <div key={character.id} className="relative">
                    <div className="aspect-square bg-gray-800 rounded-md overflow-hidden">
                      <div className="absolute top-0 right-0 p-1">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          type="button"
                          onClick={() => handleRemoveCharacter(character.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
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
                      <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                        <div className="text-xs text-white truncate">{character.name}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mostrar quantos personagens adicionais estão selecionados */}
                {selectedCharacters.length > 5 && (
                  <div className="aspect-square bg-gray-800/50 rounded-md border border-dashed border-gray-700 flex items-center justify-center">
                    <span className="text-sm text-gray-400">+{selectedCharacters.length - 5}</span>
                  </div>
                )}

                {/* Botão para adicionar personagens */}
                {(!isDeckCreation && selectedCharacters.length < 3) || isDeckCreation ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="aspect-square flex flex-col items-center justify-center border-dashed"
                    onClick={() => setIsCharacterSelectorOpen(true)}
                  >
                    <PlusCircle className="h-8 w-8 mb-2" />
                    <span className="text-sm">Adicionar</span>
                  </Button>
                ) : null}
              </div>

              {selectedCharacters.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  {isDeckCreation
                    ? "Adicione pelo menos 15 personagens ao seu deck para continuar"
                    : "Adicione personagens ao seu time para continuar"}
                </div>
              )}
            </div>

            {/* Estatísticas em uma única linha */}
            <div className="flex gap-2 justify-between">
              <div className="bg-card border rounded-md p-2 flex-1">
                <div className="text-xs font-medium text-muted-foreground">Total</div>
                <div className="text-lg font-bold">
                  {selectedCharacters.length}/{isDeckCreation ? "15+" : "3"}
                </div>
              </div>

              <div className="bg-card border rounded-md p-2 flex-1">
                <div className="text-xs font-medium text-muted-foreground">5★</div>
                <div className="text-lg font-bold">{selectedCharacters.filter((c) => c.rarity === 5).length}</div>
              </div>

              <div className="bg-card border rounded-md p-2 flex-1">
                <div className="text-xs font-medium text-muted-foreground">4★</div>
                <div className="text-lg font-bold">{selectedCharacters.filter((c) => c.rarity === 4).length}</div>
              </div>
            </div>

            {isDeckCreation && (
              <div className="bg-yellow-950/20 border border-yellow-600/30 rounded-md p-3">
                <h3 className="text-sm font-medium text-yellow-500 mb-1">Requisitos para Torneio</h3>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li className="flex items-center">
                    <div
                      className={`w-3 h-3 mr-2 rounded-full ${selectedCharacters.length >= 15 ? "bg-green-500" : "bg-gray-500"}`}
                    ></div>
                    Mínimo de 15 personagens
                  </li>
                  <li className="flex items-center">
                    <div
                      className={`w-3 h-3 mr-2 rounded-full ${calculateTeamCost(selectedCharacters.map((c) => c.id)) >= 250 ? "bg-green-500" : "bg-gray-500"}`}
                    ></div>
                    Custo mínimo de 250 pontos
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={
                isSubmitting ||
                teamName.trim() === "" ||
                selectedCharacters.length === 0 ||
                (isDeckCreation && selectedCharacters.length < 15)
              }
              className={isDeckCreation ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              {isSubmitting ? "Criando..." : isDeckCreation ? "Criar Deck" : "Criar Time"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de seleção de personagens */}
      <CharacterSelector
        open={isCharacterSelectorOpen}
        onOpenChange={setIsCharacterSelectorOpen}
        onSelect={handleAddCharacter}
        characters={characters}
        selectedCharacters={selectedCharacters.map((c) => c.id)}
        multiSelect={isDeckCreation}
      />

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este {teams.find((t) => t.id === teamToDelete)?.isDeck ? "deck" : "time"}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
