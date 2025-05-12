export type DraftPhase = "preban" | "pick" | "ban" | "complete"

export type DraftPlayer = {
  id: string
  name: string
  characters: string[]
  bans: string[]
}

export type DraftState = {
  id: string
  phase: DraftPhase
  turn: "player1" | "player2"
  player1: DraftPlayer
  player2: DraftPlayer
  prebans: string[]
  picks: {
    player1: string[]
    player2: string[]
  }
  currentPick: number
  maxPicks: number
  maxBans: number
  completed: boolean
  winner: string | null
  createdAt?: string
  updatedAt?: string
}

export type DraftSettings = {
  maxPicks: number
  maxBans: number
  maxPreBans: number
  pointLimit: number
  characterCosts: { [key: string]: number }
  weaponCosts: { [key: string]: number }
  constellationMultipliers: { [key: number]: number }
  refinementMultipliers: { [key: number]: number }
}

export interface DraftRules {
  maxPicks: number
  maxBans: number
  maxPreBans: number
  pointLimit: number
  characterCostMultiplier: {
    rarity5: number
    rarity4: number
  }
  weaponCostMultiplier: {
    rarity5: number
    rarity4: number
  }
  constellationMultipliers: { [key: number]: number }
  refinementMultipliers: { [key: number]: number }
}

export const DEFAULT_DRAFT_RULES: DraftRules = {
  maxPicks: 6,
  maxBans: 3,
  maxPreBans: 3,
  pointLimit: 1500,
  characterCostMultiplier: {
    rarity5: 10,
    rarity4: 5,
  },
  weaponCostMultiplier: {
    rarity5: 4,
    rarity4: 2,
  },
  constellationMultipliers: {
    0: 1.0,
    1: 1.1,
    2: 1.2,
    3: 1.3,
    4: 1.4,
    5: 1.5,
    6: 1.6,
  },
  refinementMultipliers: {
    1: 1.0,
    2: 1.1,
    3: 1.2,
    4: 1.3,
    5: 1.4,
  },
}

export interface DraftPoints {
  totalPoints: number
  characterPoints: number
  weaponPoints: number
  constellationPoints: number
  refinementPoints: number
}
