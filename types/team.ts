export interface Team {
  id: string
  name: string
  characters: string[] // IDs dos personagens
  totalCost: number
  isDeck: boolean // Indica se é um deck para torneio
}

export interface Deck extends Team {
  isDeck: true
  deckCost: number
  minCharacters: number
}
