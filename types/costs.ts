// Tipos para os custos de personagens e armas

export interface CharacterCost {
  id: string
  name: string
  element: string
  costs: {
    S0: number // Base (sem constelação)
    S1: number // Constelação 1
    S2: number // Constelação 2
    S3: number // Constelação 3
    S4: number // Constelação 4
    S5: number // Constelação 5
    S6: number // Constelação 6
  }
}

export interface WeaponCost {
  id: string
  name: string
  type: string
  costs: {
    A1: number // Refinamento 1
    A2: number // Refinamento 2
    A3: number // Refinamento 3
    A4: number // Refinamento 4
    A5: number // Refinamento 5
  }
}

export interface DraftRules {
  maxPoints: number
  pointsPerConstellation: number
  pointsPerRefinement: number
  maxWeaponPoints: number
  minRosterSize: number
  minTotalCost: number
  maxCharacterDifference: number
  prebanPointDifference: number
  costOptions: number[]
}

export const DEFAULT_DRAFT_RULES: DraftRules = {
  maxPoints: 1500,
  pointsPerConstellation: 100,
  pointsPerRefinement: 50,
  maxWeaponPoints: 30,
  minRosterSize: 15,
  minTotalCost: 250,
  maxCharacterDifference: 50,
  prebanPointDifference: 30,
  costOptions: [15, 20, 30],
}
