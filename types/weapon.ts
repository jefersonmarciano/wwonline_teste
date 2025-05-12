export interface Weapon {
  id: string
  name: string
  rarity: number
  type: string
  imagePath?: string
  stats?: {
    attack: number
    critRate?: number
    critDamage?: number
    elementalDamage?: number
  }
  refinement: number
  level: number
  assignedTo?: string | null
  equippedTo?: string | null
}

export type WeaponType = "Espada" | "Lâmina larga" | "Manopla" | "Retificador" | "Pistola"

export const weaponTypeMapping: Record<string, WeaponType> = {
  sword: "Espada",
  broadblade: "Lâmina larga",
  gauntlets: "Manopla",
  rectifier: "Retificador",
  pistols: "Pistola",
}
