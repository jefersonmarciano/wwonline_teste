"use client"

import { useState, useEffect } from "react"
import type { Character } from "@/types/character"

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        // Verificar se há personagens salvos no localStorage
        const savedCharacters = localStorage.getItem("characters")

        if (savedCharacters) {
          // Se houver personagens salvos, usar esses
          setCharacters(JSON.parse(savedCharacters))
        } else {
          // Dados fictícios baseados nas tabelas fornecidas, agora com imagens
          const mockCharacters: Character[] = [
            {
              id: "1",
              name: "Yinlin",
              rarity: 5,
              tier: "SS",
              element: "Eletro",
              weapon: "Retificador",
              imagePath: "/characters/yinglin.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "2",
              name: "Calcharo",
              rarity: 5,
              tier: "S",
              element: "Eletro",
              weapon: "Lâmina larga",
              imagePath: "/characters/calcharo.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "3",
              name: "Cantarella",
              rarity: 5,
              tier: "S",
              element: "Devastação",
              weapon: "Retificador",
              imagePath: "/characters/cantarela.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "4",
              name: "Changli",
              rarity: 5,
              tier: "S",
              element: "Fusão",
              weapon: "Espada",
              imagePath: "/characters/changli.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "5",
              name: "Rocha",
              rarity: 5,
              tier: "S",
              element: "Devastação",
              weapon: "Manopla",
              imagePath: "/characters/roccia.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "6",
              name: "Zhezhi",
              rarity: 5,
              tier: "SS",
              element: "Glacio",
              weapon: "Retificador",
              imagePath: "/characters/zhe.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "7",
              name: "Verina",
              rarity: 5,
              tier: "S",
              element: "Espectro",
              weapon: "Retificador",
              imagePath: "/characters/verina.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "8",
              name: "Sanhua",
              rarity: 4,
              tier: "S",
              element: "Glacio",
              weapon: "Espada",
              imagePath: "/characters/senhua.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "9",
              name: "Jiyan",
              rarity: 5,
              tier: "S",
              element: "Aero",
              weapon: "Lâmina larga",
              imagePath: "/characters/jiyan.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "10",
              name: "Guarda costeiro",
              rarity: 5,
              tier: "SS",
              element: "Espectro",
              weapon: "Retificador",
              imagePath: "/characters/keeper.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            // Personagens já adicionados previamente
            {
              id: "11",
              name: "Camélia",
              rarity: 5,
              tier: "SS",
              element: "Devastação",
              weapon: "Espada",
              imagePath: "/characters/camelia.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "12",
              name: "Xiangli Yao",
              rarity: 5,
              tier: "SS",
              element: "Eletro",
              weapon: "Manopla",
              imagePath: "/characters/xiangli.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "13",
              name: "Rover",
              rarity: 5,
              tier: "S",
              element: "Devastação",
              weapon: "Espada",
              imagePath: "/characters/rover.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "14",
              name: "Encore",
              rarity: 4,
              tier: "S",
              element: "Devastação",
              weapon: "Manopla",
              imagePath: "/characters/encore.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "15",
              name: "Brant",
              rarity: 5,
              tier: "S",
              element: "Fusão",
              weapon: "Espada",
              imagePath: "/characters/brant.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "16",
              name: "Jinhsi",
              rarity: 5,
              tier: "SS",
              element: "Espectro",
              weapon: "Lâmina larga",
              imagePath: "/characters/jinhsi.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "17",
              name: "Zani",
              rarity: 5,
              tier: "SS",
              element: "Espectro",
              weapon: "Manopla",
              imagePath: "/characters/zani.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "18",
              name: "Febe",
              rarity: 5,
              tier: "SS",
              element: "Espectro",
              weapon: "Retificador",
              imagePath: "/characters/febe.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "19",
              name: "Carlota",
              rarity: 5,
              tier: "SS",
              element: "Glacio",
              weapon: "Pistola",
              imagePath: "/characters/carlota.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            // Novos personagens adicionados agora
            {
              id: "20",
              name: "Youhu",
              rarity: 4,
              tier: "UM",
              element: "Glacio",
              weapon: "Manopla",
              imagePath: "/characters/youhu.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "21",
              name: "Jianxin",
              rarity: 5,
              tier: "UM",
              element: "Aero",
              weapon: "Manopla",
              imagePath: "/characters/jianxin.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "22",
              name: "Yuan Wu",
              rarity: 4,
              tier: "UM",
              element: "Eletro",
              weapon: "Manopla",
              imagePath: "/characters/yuanwu.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "23",
              name: "Yangyang",
              rarity: 4,
              tier: "B",
              element: "Aero",
              weapon: "Espada",
              imagePath: "/characters/yangyang.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "24",
              name: "Baizhi",
              rarity: 4,
              tier: "UM",
              element: "Glacio",
              weapon: "Retificador",
              imagePath: "/characters/baizhi.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "25",
              name: "Lumi",
              rarity: 4,
              tier: "UM",
              element: "Eletro",
              weapon: "Lâmina larga",
              imagePath: "/characters/lumi.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "26",
              name: "Aalto",
              rarity: 4,
              tier: "UM",
              element: "Aero",
              weapon: "Pistola",
              imagePath: "/characters/aalto.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            {
              id: "27",
              name: "Chixia",
              rarity: 4,
              tier: "B",
              element: "Fusão",
              weapon: "Pistola",
              imagePath: "/characters/chixia.webp",
              owned: true,
              constellation: 0,
              level: 60,
            },
            // Personagens restantes
            {
              id: "28",
              name: "Lingyang",
              rarity: 5,
              tier: "B",
              element: "Glacio",
              weapon: "Manopla",
              owned: false,
              constellation: 0,
              level: 1,
            },
            {
              id: "29",
              name: "Rover (Aero)",
              rarity: 5,
              tier: "B",
              element: "Aero",
              weapon: "Espada",
              imagePath: "/characters/rover.webp",
              owned: false,
              constellation: 0,
              level: 1,
            },
            {
              id: "30",
              name: "Rover (Spectro)",
              rarity: 5,
              tier: "UM",
              element: "Espectro",
              weapon: "Espada",
              imagePath: "/characters/rover.webp",
              owned: false,
              constellation: 0,
              level: 1,
            },
            {
              id: "31",
              name: "Danjin",
              rarity: 4,
              tier: "S",
              element: "Devastação",
              weapon: "Espada",
              owned: false,
              constellation: 0,
              level: 1,
            },
            {
              id: "32",
              name: "Mortefi",
              rarity: 4,
              tier: "S",
              element: "Fusão",
              weapon: "Pistola",
              owned: false,
              constellation: 0,
              level: 1,
            },
            {
              id: "33",
              name: "Tao Qi",
              rarity: 4,
              tier: "B",
              element: "Devastação",
              weapon: "Lâmina larga",
              owned: false,
              constellation: 0,
              level: 1,
            },
            {
              id: "34",
              name: "Encore",
              rarity: 5,
              tier: "S",
              element: "Fusão",
              weapon: "Retificador",
              imagePath: "/characters/encore.webp",
              owned: false,
              constellation: 0,
              level: 1,
            },
          ]

          setCharacters(mockCharacters)
          localStorage.setItem("characters", JSON.stringify(mockCharacters))
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  const updateCharacterOwnership = (characterId: string, owned: boolean) => {
    const updatedCharacters = characters.map((character) => {
      if (character.id === characterId) {
        return { ...character, owned }
      }
      return character
    })

    setCharacters(updatedCharacters)
    localStorage.setItem("characters", JSON.stringify(updatedCharacters))
  }

  const updateCharacterConstellation = (characterId: string, constellation: number) => {
    const updatedCharacters = characters.map((character) => {
      if (character.id === characterId) {
        return { ...character, constellation: Math.min(Math.max(0, constellation), 5) }
      }
      return character
    })

    setCharacters(updatedCharacters)
    localStorage.setItem("characters", JSON.stringify(updatedCharacters))
  }

  const updateCharacterLevel = (characterId: string, level: number) => {
    const updatedCharacters = characters.map((character) => {
      if (character.id === characterId) {
        return { ...character, level: Math.min(Math.max(1, level), 90) }
      }
      return character
    })

    setCharacters(updatedCharacters)
    localStorage.setItem("characters", JSON.stringify(updatedCharacters))
  }

  const equipWeaponToCharacter = (characterId: string, weaponId: string | null) => {
    const updatedCharacters = characters.map((character) => {
      if (character.id === characterId) {
        return { ...character, equippedWeaponId: weaponId }
      }
      return character
    })

    setCharacters(updatedCharacters)
    localStorage.setItem("characters", JSON.stringify(updatedCharacters))
  }

  return {
    characters,
    isLoading,
    error,
    updateCharacterOwnership,
    updateCharacterConstellation,
    updateCharacterLevel,
    equipWeaponToCharacter,
  }
}
