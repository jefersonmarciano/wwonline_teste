"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { CHARACTER_COSTS } from "@/data/character-costs"
import { WEAPON_COSTS } from "@/data/weapon-costs"
import { DEFAULT_DRAFT_RULES } from "@/types/costs"
import type { CharacterCost, WeaponCost, DraftRules } from "@/types/costs"
import type { Character } from "@/types/character"
import type { Weapon } from "@/types/weapon"

interface CostsContextType {
  characterCosts: CharacterCost[]
  weaponCosts: WeaponCost[]
  draftRules: DraftRules
  calculateCharacterCost: (character: Character) => number
  calculateWeaponCost: (weapon: Weapon) => number
  calculateTotalCost: (characters: Character[], weapons: Weapon[]) => number
  updateCharacterCost: (characterId: string, costs: Partial<CharacterCost["costs"]>) => void
  updateWeaponCost: (weaponId: string, costs: Partial<WeaponCost["costs"]>) => void
  updateDraftRules: (rules: Partial<DraftRules>) => void
  resetToDefaults: () => void
}

const CostsContext = createContext<CostsContextType | undefined>(undefined)

export function CostsProvider({ children }: { children: React.ReactNode }) {
  const [characterCosts, setCharacterCosts] = useState<CharacterCost[]>(CHARACTER_COSTS)
  const [weaponCosts, setWeaponCosts] = useState<WeaponCost[]>(WEAPON_COSTS)
  const [draftRules, setDraftRules] = useState<DraftRules>(DEFAULT_DRAFT_RULES)

  // Carregar custos do localStorage se disponíveis
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCharacterCosts = localStorage.getItem("characterCosts")
      const savedWeaponCosts = localStorage.getItem("weaponCosts")
      const savedDraftRules = localStorage.getItem("draftRules")

      if (savedCharacterCosts) {
        try {
          setCharacterCosts(JSON.parse(savedCharacterCosts))
        } catch (e) {
          console.error("Erro ao carregar custos de personagens:", e)
        }
      }

      if (savedWeaponCosts) {
        try {
          setWeaponCosts(JSON.parse(savedWeaponCosts))
        } catch (e) {
          console.error("Erro ao carregar custos de armas:", e)
        }
      }

      if (savedDraftRules) {
        try {
          setDraftRules(JSON.parse(savedDraftRules))
        } catch (e) {
          console.error("Erro ao carregar regras de draft:", e)
        }
      }
    }
  }, [])

  // Salvar custos no localStorage quando mudarem
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("characterCosts", JSON.stringify(characterCosts))
      localStorage.setItem("weaponCosts", JSON.stringify(weaponCosts))
      localStorage.setItem("draftRules", JSON.stringify(draftRules))
    }
  }, [characterCosts, weaponCosts, draftRules])

  // Calcular custo de um personagem baseado na constelação
  const calculateCharacterCost = (character: Character): number => {
    const characterCost = characterCosts.find((c) => c.id === character.id)
    if (!characterCost) return 0

    // Usar o custo correspondente à constelação do personagem
    const constellationLevel = `S${character.constellation}` as keyof CharacterCost["costs"]
    return characterCost.costs[constellationLevel] || 0
  }

  // Calcular custo de uma arma baseado no refinamento
  const calculateWeaponCost = (weapon: Weapon): number => {
    const weaponCost = weaponCosts.find((w) => w.id === weapon.id)
    if (!weaponCost) return 0

    // Usar o custo correspondente ao refinamento da arma
    const refinementLevel = `A${weapon.refinement}` as keyof WeaponCost["costs"]
    return weaponCost.costs[refinementLevel] || 0
  }

  // Calcular custo total de um conjunto de personagens e armas
  const calculateTotalCost = (characters: Character[], weapons: Weapon[]): number => {
    const charactersCost = characters.reduce((total, character) => {
      return total + calculateCharacterCost(character)
    }, 0)

    const weaponsCost = weapons.reduce((total, weapon) => {
      return total + calculateWeaponCost(weapon)
    }, 0)

    return charactersCost + weaponsCost
  }

  // Atualizar custo de um personagem
  const updateCharacterCost = (characterId: string, costs: Partial<CharacterCost["costs"]>) => {
    setCharacterCosts((prevCosts) => {
      return prevCosts.map((character) => {
        if (character.id === characterId) {
          return {
            ...character,
            costs: { ...character.costs, ...costs },
          }
        }
        return character
      })
    })
  }

  // Atualizar custo de uma arma
  const updateWeaponCost = (weaponId: string, costs: Partial<WeaponCost["costs"]>) => {
    setWeaponCosts((prevCosts) => {
      return prevCosts.map((weapon) => {
        if (weapon.id === weaponId) {
          return {
            ...weapon,
            costs: { ...weapon.costs, ...costs },
          }
        }
        return weapon
      })
    })
  }

  // Atualizar regras de draft
  const updateDraftRules = (rules: Partial<DraftRules>) => {
    setDraftRules((prevRules) => ({ ...prevRules, ...rules }))
  }

  // Resetar para os valores padrão
  const resetToDefaults = () => {
    setCharacterCosts(CHARACTER_COSTS)
    setWeaponCosts(WEAPON_COSTS)
    setDraftRules(DEFAULT_DRAFT_RULES)

    if (typeof window !== "undefined") {
      localStorage.removeItem("characterCosts")
      localStorage.removeItem("weaponCosts")
      localStorage.removeItem("draftRules")
    }
  }

  return (
    <CostsContext.Provider
      value={{
        characterCosts,
        weaponCosts,
        draftRules,
        calculateCharacterCost,
        calculateWeaponCost,
        calculateTotalCost,
        updateCharacterCost,
        updateWeaponCost,
        updateDraftRules,
        resetToDefaults,
      }}
    >
      {children}
    </CostsContext.Provider>
  )
}

export function useCosts() {
  const context = useContext(CostsContext)
  if (context === undefined) {
    throw new Error("useCosts must be used within a CostsProvider")
  }
  return context
}
