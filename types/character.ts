export interface Character {
  id: string
  name: string
  rarity: number
  tier: string
  element: string
  weapon: string
  imagePath?: string
  owned: boolean
  constellation: number
  level: number
  equippedWeaponId?: string | null
}
