"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useTeams } from "@/hooks/use-teams"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, Info } from "lucide-react"

export default function CreateTeamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { createTeam } = useTeams()
  const { characters } = useCharacters()
  const { weapons } = useWeapons()

  const [teamName, setTeamName] = useState("")
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [isValid, setIsValid] = useState(false)
  const [totalCost, setTotalCost] = useState(0)
  const [characterCosts, setCharacterCosts] = useState<{ [key: string]: number }>({})
  const [weaponCosts, setWeaponCosts] = useState<{ [key: string]: number }>({})

  const MIN_ROSTER_SIZE = 15
  const MIN_ACCOUNT_COST = 250

  useEffect(() => {
    // Calculate character costs
    const charCosts: { [key: string]: number } = {}
    characters.forEach((char) => {
      charCosts[char.id] = char.rarity === 5 ? 10 : 5
    })
    setCharacterCosts(charCosts)

    // Calculate weapon costs
    const wpnCosts: { [key: string]: number } = {}
    weapons.forEach((weapon) => {
      wpnCosts[weapon.id] = weapon.rarity === 5 ? 4 : 2
    })
    setWeaponCosts(wpnCosts)
  }, [characters, weapons])

  useEffect(() => {
    // Calculate total cost
    let cost = 0

    // Add character costs
    selectedCharacters.forEach((charId) => {
      cost += characterCosts[charId] || 0

      // Add weapon costs if equipped
      const weapon = weapons.find((w) => w.equippedTo === charId)
      if (weapon) {
        cost += weaponCosts[weapon.id] || 0
      }
    })

    setTotalCost(cost)

    // Validate team
    setIsValid(teamName.trim().length > 0 && selectedCharacters.length >= MIN_ROSTER_SIZE && cost >= MIN_ACCOUNT_COST)
  }, [teamName, selectedCharacters, characterCosts, weaponCosts, weapons])

  const handleSelectCharacter = (characterId: string) => {
    if (selectedCharacters.includes(characterId)) {
      setSelectedCharacters(selectedCharacters.filter((id) => id !== characterId))
    } else {
      setSelectedCharacters([...selectedCharacters, characterId])
    }
  }

  const handleCreateTeam = () => {
    if (!isValid) {
      toast({
        title: "Erro ao criar deck",
        description: "Verifique se você preencheu todos os campos corretamente.",
        variant: "destructive",
      })
      return
    }

    createTeam({
      id: Date.now().toString(),
      name: teamName,
      characters: selectedCharacters,
    })

    toast({
      title: "Deck criado com sucesso!",
      description: "Seu deck foi criado e está pronto para uso.",
      variant: "default",
    })

    router.push("/teams")
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Criar Novo Deck</CardTitle>
          <CardDescription>Crie um deck com pelo menos 15 personagens para participar de torneios.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Nome do Deck</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Digite o nome do seu deck"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>
                  Personagens Selecionados ({selectedCharacters.length}/{MIN_ROSTER_SIZE}+)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Você precisa selecionar pelo menos 15 personagens para criar um deck válido.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Progress value={(selectedCharacters.length / MIN_ROSTER_SIZE) * 100} max={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>
                  Custo Total ({totalCost}/{MIN_ACCOUNT_COST}+)
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>O custo total do seu deck deve ser de pelo menos 250 pontos.</p>
                      <p>Personagens 5★: 10 pontos</p>
                      <p>Personagens 4★: 5 pontos</p>
                      <p>Armas 5★: 4 pontos</p>
                      <p>Armas 4★: 2 pontos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Progress value={(totalCost / MIN_ACCOUNT_COST) * 100} max={100} className="h-2" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/teams")}>
            Cancelar
          </Button>
          <Button onClick={handleCreateTeam} disabled={!isValid}>
            Criar Deck
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selecione os Personagens</CardTitle>
          <CardDescription>
            Escolha pelo menos 15 personagens para o seu deck. As armas equipadas serão incluídas automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => {
              const isSelected = selectedCharacters.includes(character.id)
              const equippedWeapon = weapons.find((w) => w.equippedTo === character.id)
              const characterCost = characterCosts[character.id] || 0
              const weaponCost = equippedWeapon ? weaponCosts[equippedWeapon.id] || 0 : 0
              const totalItemCost = characterCost + weaponCost

              return (
                <div
                  key={character.id}
                  className={`
                    border rounded-lg p-2 cursor-pointer transition-all
                    ${isSelected ? "border-primary bg-primary/10" : "border-gray-700"}
                  `}
                  onClick={() => handleSelectCharacter(character.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <img
                        src={`/characters/${character.id}.webp`}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-primary rounded-bl-md p-1">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{character.name}</div>
                      <div className="text-sm text-gray-400">
                        {character.rarity}★ {character.weaponType}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{characterCost} pts</span>
                        {equippedWeapon && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center ml-2">
                                  <img
                                    src={`/weapons/${equippedWeapon.id}.webp`}
                                    alt={equippedWeapon.name}
                                    className="w-5 h-5 object-cover rounded-sm mr-1"
                                  />
                                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                                    +{weaponCost} pts
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {equippedWeapon.name} ({equippedWeapon.rarity}★)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>

                    <div className="text-lg font-bold">{totalItemCost}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
