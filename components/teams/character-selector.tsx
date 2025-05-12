"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Check } from "lucide-react"
import Image from "next/image"
import type { Character } from "@/types/character"

interface CharacterSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (character: Character) => void
  characters: Character[]
  selectedCharacters: string[]
  multiSelect?: boolean
}

export default function CharacterSelector({
  open,
  onOpenChange,
  onSelect,
  characters,
  selectedCharacters,
  multiSelect = false,
}: CharacterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Filtrar personagens com base no termo de pesquisa e na aba ativa
    let filtered = characters

    // Filtrar por termo de pesquisa
    if (searchTerm) {
      filtered = filtered.filter((character) => character.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filtrar por aba
    if (activeTab === "5-star") {
      filtered = filtered.filter((character) => character.rarity === 5)
    } else if (activeTab === "4-star") {
      filtered = filtered.filter((character) => character.rarity === 4)
    } else if (activeTab === "owned") {
      filtered = filtered.filter((character) => character.owned)
    }

    setFilteredCharacters(filtered)
  }, [characters, searchTerm, activeTab])

  const handleSelect = (character: Character) => {
    onSelect(character)
    // Removido o fechamento automático do modal quando não é multiSelect
    // Agora o modal só fecha quando o usuário clica em "Concluído" ou "Cancelar"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar Personagem</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar personagem..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="5-star">5★</TabsTrigger>
            <TabsTrigger value="4-star">4★</TabsTrigger>
            <TabsTrigger value="owned">Obtidos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredCharacters.map((character) => {
                const isSelected = selectedCharacters.includes(character.id)
                return (
                  <div
                    key={character.id}
                    className={`relative cursor-pointer rounded-md overflow-hidden transition-all ${
                      isSelected ? "ring-2 ring-primary" : "hover:opacity-80"
                    }`}
                    onClick={() => handleSelect(character)}
                  >
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
                        <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
                          {character.element}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
                          {character.rarity}★
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
                        <div className="text-lg font-semibold truncate text-white">{character.name}</div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-300">{character.tier}</div>
                          <div className="text-sm text-gray-300">Lv.{character.level}</div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary rounded-full p-1">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {filteredCharacters.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Nenhum personagem encontrado com os filtros atuais.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {multiSelect ? "Concluído" : "Cancelar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
