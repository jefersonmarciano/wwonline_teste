"use client"

import { useState, useEffect } from "react"
import type { Team, Deck } from "@/types/team"
import { useCharacters } from "./use-characters"

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { characters } = useCharacters()

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Verificar se há times salvos no localStorage
        const savedTeams = localStorage.getItem("teams")

        if (savedTeams) {
          // Se houver times salvos, usar esses
          const parsedTeams = JSON.parse(savedTeams)
          setTeams(parsedTeams)
        } else {
          // Se não houver times salvos, criar dados fictícios
          if (characters.length > 0) {
            const mockTeams: Team[] = [
              {
                id: "1",
                name: "Time Principal",
                characters: ["1", "2", "3"],
                totalCost: 1250,
                isDeck: false,
              },
              {
                id: "2",
                name: "Time Secundário",
                characters: ["6", "7", "8"],
                totalCost: 980,
                isDeck: false,
              },
              {
                id: "deck-1",
                name: "Deck Torneio",
                characters: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
                totalCost: 3500,
                isDeck: true,
                deckCost: 3500,
                minCharacters: 15,
              },
            ]
            setTeams(mockTeams)

            // Salvar os times fictícios no localStorage
            localStorage.setItem("teams", JSON.stringify(mockTeams))
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    if (characters.length > 0) {
      fetchTeams()
    }
  }, [characters])

  // Função para adicionar um novo time
  const addTeam = async (team: Team) => {
    const newTeams = [...teams, team]
    setTeams(newTeams)

    // Salvar no localStorage
    localStorage.setItem("teams", JSON.stringify(newTeams))

    return team
  }

  // Função para remover um time
  const removeTeam = async (teamId: string) => {
    const newTeams = teams.filter((team) => team.id !== teamId)
    setTeams(newTeams)

    // Salvar no localStorage
    localStorage.setItem("teams", JSON.stringify(newTeams))
  }

  // Função para atualizar um time existente
  const updateTeam = async (updatedTeam: Team) => {
    const newTeams = teams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
    setTeams(newTeams)

    // Salvar no localStorage
    localStorage.setItem("teams", JSON.stringify(newTeams))

    return updatedTeam
  }

  // Função para calcular o custo total de um time/deck
  const calculateTeamCost = (characterIds: string[]) => {
    return characterIds.reduce((total, charId) => {
      const character = characters.find((c) => c.id === charId)
      if (!character) return total

      // Custo base baseado na raridade
      let cost = character.rarity === 5 ? 500 : 300

      // Adicionar custo de constelação
      cost += character.constellation * 100

      return total + cost
    }, 0)
  }

  // Função para verificar se um deck é válido (mínimo 15 personagens, custo mínimo 250)
  const isDeckValid = (characterIds: string[]) => {
    if (characterIds.length < 15) return false

    const cost = calculateTeamCost(characterIds)
    return cost >= 250
  }

  // Função para criar um novo deck
  const createDeck = async (name: string, characterIds: string[]) => {
    if (!isDeckValid(characterIds)) {
      throw new Error("Deck inválido: precisa ter pelo menos 15 personagens e custo mínimo de 250")
    }

    const deckCost = calculateTeamCost(characterIds)

    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      characters: characterIds,
      totalCost: deckCost,
      isDeck: true,
      deckCost,
      minCharacters: 15,
    }

    return addTeam(newDeck)
  }

  // Função para obter apenas os decks
  const getDecks = () => {
    return teams.filter((team) => team.isDeck) as Deck[]
  }

  // Função para obter apenas os times normais
  const getNormalTeams = () => {
    return teams.filter((team) => !team.isDeck)
  }

  return {
    teams,
    isLoading,
    error,
    addTeam,
    removeTeam,
    updateTeam,
    calculateTeamCost,
    isDeckValid,
    createDeck,
    getDecks,
    getNormalTeams,
  }
}
