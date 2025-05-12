import type { WeaponCost } from "@/types/costs"

// Custos das armas por tipo e refinamento
export const WEAPON_COSTS: WeaponCost[] = [
  // BROADBLADE
  {
    id: "lustrous-razor-broadblade",
    name: "Lustrous Razor",
    type: "Lâmina larga",
    costs: { A1: 3, A2: 3, A3: 4, A4: 4, A5: 5 },
  },
  {
    id: "verdant-summit-broadblade",
    name: "Verdant Summit",
    type: "Lâmina larga",
    costs: { A1: 4, A2: 4, A3: 5, A4: 5, A5: 6 },
  },
  {
    id: "ages-of-harvest-broadblade",
    name: "Ages of Harvest",
    type: "Lâmina larga",
    costs: { A1: 4, A2: 4, A3: 5, A4: 5, A5: 6 },
  },
  {
    id: "autumntrace-broadblade",
    name: "Autumntrace",
    type: "Lâmina larga",
    costs: { A1: 1, A2: 1, A3: 1, A4: 2, A5: 2 },
  },
  {
    id: "helios-cleaver-broadblade",
    name: "Helios Cleaver",
    type: "Lâmina larga",
    costs: { A1: 0, A2: 0, A3: 1, A4: 1, A5: 1 },
  },
  {
    id: "dauntless-evernight-broadblade",
    name: "Dauntless Evernight",
    type: "Lâmina larga",
    costs: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 },
  },
  {
    id: "discord-broadblade",
    name: "Discord",
    type: "Lâmina larga",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },
  {
    id: "waning-redshift-broadblade",
    name: "Waning Redshift",
    type: "Lâmina larga",
    costs: { A1: 0, A2: 0, A3: 1, A4: 1, A5: 1 },
  },

  // GAUNTLETS
  {
    id: "abyss-surges-gauntlets",
    name: "Abyss Surges",
    type: "Manopla",
    costs: { A1: 3, A2: 3, A3: 4, A4: 4, A5: 5 },
  },
  {
    id: "veritys-handle-gauntlets",
    name: "Verity's Handle",
    type: "Manopla",
    costs: { A1: 4, A2: 4, A3: 5, A4: 5, A5: 6 },
  },
  {
    id: "tragicomedy-gauntlets",
    name: "Tragicomedy",
    type: "Manopla",
    costs: { A1: 3, A2: 3, A3: 4, A4: 4, A5: 4 },
  },
  {
    id: "blazing-justice-gauntlets",
    name: "Blazing Justice",
    type: "Manopla",
    costs: { A1: 5, A2: 5, A3: 6, A4: 6, A5: 7 },
  },
  {
    id: "stonard-gauntlets",
    name: "Stonard",
    type: "Manopla",
    costs: { A1: 1, A2: 1, A3: 1, A4: 2, A5: 2 },
  },
  {
    id: "amity-accord-gauntlets",
    name: "Amity Accord",
    type: "Manopla",
    costs: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 1 },
  },
  {
    id: "celestial-spiral-gauntlets",
    name: "Celestial Spiral",
    type: "Manopla",
    costs: { A1: 0, A2: 0, A3: 1, A4: 1, A5: 1 },
  },
  {
    id: "hollow-mirage-gauntlets",
    name: "Hollow Mirage",
    type: "Manopla",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },
  {
    id: "marcato-gauntlets",
    name: "Marcato",
    type: "Manopla",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },

  // PISTOLS
  {
    id: "static-mist-pistols",
    name: "Static Mist",
    type: "Pistola",
    costs: { A1: 4, A2: 4, A3: 5, A4: 5, A5: 6 },
  },
  {
    id: "the-last-dance-pistols",
    name: "The Last Dance",
    type: "Pistola",
    costs: { A1: 4, A2: 4, A3: 5, A4: 5, A5: 6 },
  },
  {
    id: "thunderbolt-pistols",
    name: "Thunderbolt",
    type: "Pistola",
    costs: { A1: 0, A2: 1, A3: 1, A4: 1, A5: 2 },
  },
  {
    id: "cadenza-pistols",
    name: "Cadenza",
    type: "Pistola",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },
  {
    id: "novaburst-pistols",
    name: "Novaburst",
    type: "Pistola",
    costs: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 1 },
  },
  {
    id: "relativistic-jet-pistols",
    name: "Relativistic Jet",
    type: "Pistola",
    costs: { A1: 0, A2: 0, A3: 1, A4: 1, A5: 1 },
  },
  {
    id: "undying-flame-pistols",
    name: "Undying Flame",
    type: "Pistola",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },

  // RECTIFIER
  {
    id: "cosmic-ripples-rectifier",
    name: "Cosmic Ripples",
    type: "Retificador",
    costs: { A1: 3, A2: 3, A3: 4, A4: 4, A5: 5 },
  },
  {
    id: "whispers-of-sirens-rectifier",
    name: "Whispers of Sirens",
    type: "Retificador",
    costs: { A1: 4, A2: 4, A3: 4, A4: 5, A5: 5 },
  },
  {
    id: "luminous-hymn-rectifier",
    name: "Luminous Hymn",
    type: "Retificador",
    costs: { A1: 4, A2: 4, A3: 5, A4: 5, A5: 6 },
  },
  {
    id: "rime-draped-sprouts-rectifier",
    name: "Rime-Draped Sprouts",
    type: "Retificador",
    costs: { A1: 4, A2: 4, A3: 5, A4: 5, A5: 6 },
  },
  {
    id: "stellar-symphony-rectifier",
    name: "Stellar Symphony",
    type: "Retificador",
    costs: { A1: 4, A2: 4, A3: 5, A4: 6, A5: 6 },
  },
  {
    id: "stringmaster-rectifier",
    name: "Stringmaster",
    type: "Retificador",
    costs: { A1: 5, A2: 5, A3: 6, A4: 6, A5: 7 },
  },
  {
    id: "augment-rectifier",
    name: "Augment",
    type: "Retificador",
    costs: { A1: 1, A2: 1, A3: 1, A4: 2, A5: 2 },
  },
  {
    id: "oceans-gift-rectifier",
    name: "Ocean's Gift",
    type: "Retificador",
    costs: { A1: 1, A2: 1, A3: 1, A4: 2, A5: 2 },
  },
  {
    id: "comet-flare-rectifier",
    name: "Comet Flare",
    type: "Retificador",
    costs: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0 },
  },
  {
    id: "fusion-accretion-rectifier",
    name: "Fusion Accretion",
    type: "Retificador",
    costs: { A1: 0, A2: 0, A3: 1, A4: 1, A5: 2 },
  },
  {
    id: "jinzhou-keeper-rectifier",
    name: "Jinzhou Keeper",
    type: "Retificador",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },
  {
    id: "variation-rectifier",
    name: "Variation",
    type: "Retificador",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },

  // SWORD
  {
    id: "emerald-of-genesis-sword",
    name: "Emerald of Genesis",
    type: "Espada",
    costs: { A1: 4, A2: 4, A3: 5, A4: 5, A5: 6 },
  },
  {
    id: "blazing-brilliance-sword",
    name: "Blazing Brilliance",
    type: "Espada",
    costs: { A1: 5, A2: 5, A3: 6, A4: 6, A5: 7 },
  },
  {
    id: "red-spring-sword",
    name: "Red Spring",
    type: "Espada",
    costs: { A1: 4, A2: 4, A3: 5, A4: 6, A5: 6 },
  },
  {
    id: "unflickering-valor-sword",
    name: "Unflickering Valor",
    type: "Espada",
    costs: { A1: 2, A2: 2, A3: 3, A4: 3, A5: 3 },
  },
  {
    id: "bloodpacts-pledge-sword",
    name: "Bloodpact's Pledge",
    type: "Espada",
    costs: { A1: 1, A2: 1, A3: 1, A4: 1, A5: 1 },
  },
  {
    id: "lumingloss-sword",
    name: "Lumingloss",
    type: "Espada",
    costs: { A1: 1, A2: 1, A3: 1, A4: 1, A5: 1 },
  },
  {
    id: "somnoire-anchor-sword",
    name: "Somnoire Anchor",
    type: "Espada",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 2 },
  },
  {
    id: "lunar-cutter-sword",
    name: "Lunar Cutter",
    type: "Espada",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },
  {
    id: "endless-collapse-sword",
    name: "Endless Collapse",
    type: "Espada",
    costs: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 1 },
  },
  {
    id: "commando-of-conviction-sword",
    name: "Commando of Conviction",
    type: "Espada",
    costs: { A1: 0, A2: 0, A3: 1, A4: 1, A5: 1 },
  },
  {
    id: "overture-sword",
    name: "Overture",
    type: "Espada",
    costs: { A1: 0, A2: 0, A3: 0, A4: 1, A5: 1 },
  },
]
