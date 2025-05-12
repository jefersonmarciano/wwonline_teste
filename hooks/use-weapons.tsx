"use client"

import { useState, useEffect } from "react"
import type { Weapon, WeaponType } from "@/types/weapon"

export function useWeapons() {
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        // Verificar se há armas salvas no localStorage
        const savedWeapons = localStorage.getItem("weapons")

        if (savedWeapons) {
          // Se houver armas salvas, usar essas
          setWeapons(JSON.parse(savedWeapons))
        } else {
          // Se não houver armas salvas, criar dados iniciais
          const initialWeapons: Weapon[] = [
            {
              id: "weapon-1",
              name: "Tragicomedy",
              type: "Manopla",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/tragicomedy-gauntlets.webp",
              description: "Uma manopla ornamentada com detalhes em roxo e rosa.",
              stats: {
                attack: 542,
                critRate: 8.4,
                critDamage: 15.2,
              },
              passive: "Aumenta o dano de habilidades em 20%.",
              assignedTo: null,
            },
            {
              id: "weapon-2",
              name: "Verity's Handle",
              type: "Manopla",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/veritys-handle-gauntlets.webp",
              description: "Uma manopla elegante com tons de azul e prata.",
              stats: {
                attack: 532,
                critDamage: 22.4,
              },
              passive: "Aumenta a velocidade de ataque em 15%.",
              assignedTo: null,
            },
            {
              id: "weapon-3",
              name: "Verdant Summit",
              type: "Lâmina larga",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/verdant-summit-broadblade.webp",
              description: "Uma lâmina larga com detalhes em verde e dourado.",
              stats: {
                attack: 608,
                critRate: 10.2,
              },
              passive: "Aumenta o dano contra inimigos com escudo em 30%.",
              assignedTo: null,
            },
            {
              id: "weapon-4",
              name: "Whispers of Sirens",
              type: "Retificador",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/whispers-of-sirens-rectifier.webp",
              description: "Um retificador com design fluido em tons de azul e branco.",
              stats: {
                attack: 565,
                elementalDamage: 18.6,
              },
              passive: "Aumenta o dano de habilidades de área em 25%.",
              assignedTo: null,
            },
            {
              id: "weapon-5",
              name: "Unflickering Valor",
              type: "Espada",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/unflickering-valor-sword.webp",
              description: "Uma espada com detalhes em roxo e prata.",
              stats: {
                attack: 510,
                critRate: 12.8,
                critDamage: 10.5,
              },
              passive: "Aumenta a velocidade de movimento em 10% após usar uma habilidade.",
              assignedTo: null,
            },
            {
              id: "weapon-6",
              name: "The Last Dance",
              type: "Pistola",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/the-last-dance-pistols.webp",
              description: "Uma pistola elegante com detalhes em vermelho e prata.",
              stats: {
                attack: 486,
                critRate: 14.2,
              },
              passive: "Aumenta o dano à distância em 20%.",
              assignedTo: null,
            },
            {
              id: "weapon-7",
              name: "Rime-Draped Sprouts",
              type: "Retificador",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/rime-draped-sprouts-rectifier.webp",
              description: "Um retificador com aparência gelada em tons de branco e azul.",
              stats: {
                attack: 552,
                elementalDamage: 20.4,
              },
              passive: "Aumenta o dano de Glacio em 25%.",
              assignedTo: null,
            },
            {
              id: "weapon-8",
              name: "Stellar Symphony",
              type: "Retificador",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/stellar-symphony-rectifier.webp",
              description: "Um retificador com elementos estelares em tons de azul e roxo.",
              stats: {
                attack: 575,
                critDamage: 18.6,
              },
              passive: "Aumenta o dano contra inimigos afetados por status em 30%.",
              assignedTo: null,
            },
            {
              id: "weapon-9",
              name: "Stringmaster",
              type: "Retificador",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/stringmaster-rectifier.webp",
              description: "Um retificador com detalhes em vermelho e dourado.",
              stats: {
                attack: 560,
                critRate: 9.8,
                critDamage: 12.4,
              },
              passive: "Aumenta o dano de habilidades carregadas em 35%.",
              assignedTo: null,
            },
            {
              id: "weapon-10",
              name: "Static Mist",
              type: "Pistola",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/static-mist-pistols.webp",
              description: "Uma pistola com design futurista em tons de azul e prata.",
              stats: {
                attack: 492,
                elementalDamage: 16.8,
              },
              passive: "Aumenta o dano de Eletro em 25%.",
              assignedTo: null,
            },
            // Novas armas adicionadas
            {
              id: "weapon-11",
              name: "Emerald of Genesis",
              type: "Espada",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/emerald-of-genesis-sword.webp",
              description: "Uma espada elegante com detalhes em verde e prata.",
              stats: {
                attack: 515,
                critRate: 10.5,
                elementalDamage: 12.8,
              },
              passive: "Aumenta o dano de Aero em 25%.",
              assignedTo: null,
            },
            {
              id: "weapon-12",
              name: "Cosmic Ripples",
              type: "Retificador",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/cosmic-ripples-rectifier.webp",
              description: "Um retificador com design cósmico em tons de azul.",
              stats: {
                attack: 568,
                critDamage: 20.2,
              },
              passive: "Aumenta o dano de habilidades em 22% após usar uma esquiva.",
              assignedTo: null,
            },
            {
              id: "weapon-13",
              name: "Lustrous Razor",
              type: "Lâmina larga",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/lustrous-razor-broadblade.webp",
              description: "Uma lâmina larga com detalhes em azul e dourado.",
              stats: {
                attack: 612,
                critRate: 8.6,
                elementalDamage: 14.2,
              },
              passive: "Aumenta o dano contra inimigos afetados por Glacio em 30%.",
              assignedTo: null,
            },
            {
              id: "weapon-14",
              name: "Red Spring",
              type: "Espada",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/red-spring-sword.webp",
              description: "Uma espada com detalhes em vermelho e prata.",
              stats: {
                attack: 520,
                critDamage: 18.4,
              },
              passive: "Aumenta o dano de Fusão em 25%.",
              assignedTo: null,
            },
            {
              id: "weapon-15",
              name: "Luminous Hymn",
              type: "Retificador",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/luminous-hymn-rectifier.webp",
              description: "Um retificador com design luminoso em tons de branco e azul.",
              stats: {
                attack: 570,
                elementalDamage: 22.6,
              },
              passive: "Aumenta o dano de habilidades em 25% contra inimigos com mais de 50% de HP.",
              assignedTo: null,
            },
            {
              id: "weapon-16",
              name: "Blazing Brilliance",
              type: "Espada",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/blazing-brilliance-sword.webp",
              description: "Uma espada com detalhes em laranja e dourado.",
              stats: {
                attack: 525,
                critRate: 11.2,
                critDamage: 14.8,
              },
              passive: "Aumenta o dano de Fusão em 25% e a velocidade de ataque em 10%.",
              assignedTo: null,
            },
            {
              id: "weapon-17",
              name: "Blazing Justice",
              type: "Manopla",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/blazing-justice-gauntlets.webp",
              description: "Uma manopla com detalhes em dourado e laranja.",
              stats: {
                attack: 545,
                critRate: 12.4,
              },
              passive: "Aumenta o dano de habilidades em 30% após acertar 3 ataques consecutivos.",
              assignedTo: null,
            },
            {
              id: "weapon-18",
              name: "Abyss Surges",
              type: "Manopla",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/abyss-surges-gauntlets.webp",
              description: "Uma manopla com design abissal em tons de azul.",
              stats: {
                attack: 538,
                elementalDamage: 19.8,
              },
              passive: "Aumenta o dano de Glacio em 25% e a resistência a interrupções em 20%.",
              assignedTo: null,
            },
            {
              id: "weapon-19",
              name: "Bloodpact's Pledge",
              type: "Espada",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/bloodpacts-pledge-sword.webp",
              description: "Uma espada com detalhes em azul e prata.",
              stats: {
                attack: 518,
                critDamage: 22.4,
              },
              passive: "Aumenta o dano em 20% contra inimigos com menos de 50% de HP.",
              assignedTo: null,
            },
            {
              id: "weapon-20",
              name: "Ages of Harvest",
              type: "Lâmina larga",
              rarity: 5,
              refinement: 1,
              level: 60,
              imagePath: "/weapons/ages-of-harvest-broadblade.webp",
              description: "Uma lâmina larga com detalhes em azul e prata.",
              stats: {
                attack: 605,
                elementalDamage: 16.8,
              },
              passive: "Aumenta o dano de habilidades em 25% e a regeneração de energia em 15%.",
              assignedTo: null,
            },
          ]

          setWeapons(initialWeapons)
          localStorage.setItem("weapons", JSON.stringify(initialWeapons))
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeapons()
  }, [])

  const assignWeaponToCharacter = (weaponId: string, characterId: string | null) => {
    // Primeiro, remover a arma de qualquer personagem que já a tenha
    const updatedWeapons = weapons.map((weapon) => {
      if (weapon.assignedTo === characterId) {
        return { ...weapon, assignedTo: null }
      }
      return weapon
    })

    // Depois, atribuir a arma ao personagem
    const finalWeapons = updatedWeapons.map((weapon) => {
      if (weapon.id === weaponId) {
        return { ...weapon, assignedTo: characterId }
      }
      return weapon
    })

    setWeapons(finalWeapons)
    localStorage.setItem("weapons", JSON.stringify(finalWeapons))
  }

  const updateWeaponRefinement = (weaponId: string, refinement: number) => {
    const updatedWeapons = weapons.map((weapon) => {
      if (weapon.id === weaponId) {
        return { ...weapon, refinement: Math.min(Math.max(1, refinement), 5) }
      }
      return weapon
    })

    setWeapons(updatedWeapons)
    localStorage.setItem("weapons", JSON.stringify(updatedWeapons))
  }

  const updateWeaponLevel = (weaponId: string, level: number) => {
    const updatedWeapons = weapons.map((weapon) => {
      if (weapon.id === weaponId) {
        return { ...weapon, level: Math.min(Math.max(1, level), 90) }
      }
      return weapon
    })

    setWeapons(updatedWeapons)
    localStorage.setItem("weapons", JSON.stringify(updatedWeapons))
  }

  const getWeaponsByType = (type: WeaponType) => {
    return weapons.filter((weapon) => weapon.type === type)
  }

  const getWeaponById = (id: string) => {
    return weapons.find((weapon) => weapon.id === id)
  }

  const getWeaponsByCharacter = (characterId: string) => {
    return weapons.filter((weapon) => weapon.assignedTo === characterId)
  }

  const getAvailableWeaponsForCharacter = (characterWeaponType: WeaponType) => {
    return weapons.filter(
      (weapon) =>
        (weapon.assignedTo === null || weapon.assignedTo === undefined) && weapon.type === characterWeaponType,
    )
  }

  return {
    weapons,
    isLoading,
    error,
    assignWeaponToCharacter,
    updateWeaponRefinement,
    updateWeaponLevel,
    getWeaponsByType,
    getWeaponById,
    getWeaponsByCharacter,
    getAvailableWeaponsForCharacter,
  }
}
