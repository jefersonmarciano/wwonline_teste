"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import { useDraft } from "@/hooks/use-draft"
import { useTeams } from "@/hooks/use-teams"
import { Button } from "@/components/ui/button"
import { Ban, Shield, Zap, Wind, Flame, Sun, Snowflake, Target, Filter, Loader } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import type { Deck } from "@/types/team"
import type { Character } from "@/types/character"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DraftRoomPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { characters } = useCharacters()
  const { weapons } = useWeapons()
  const { teams, getDecks } = useTeams()
  const { draft, isLoading: draftLoading, error, getDraftById, joinDraft, makePick, makeBan } = useDraft()

  // Estado local
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [opponentDeck, setOpponentDeck] = useState<Deck | null>(null)
  const [isDeckSelectorOpen, setIsDeckSelectorOpen] = useState(true)
  const [timeLeft, setTimeLeft] = useState(45)
  const [additionalTimeLeft, setAdditionalTimeLeft] = useState(230)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeFilterOpponent, setActiveFilterOpponent] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string>("")

  // Characters state
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [availableCharactersOpponent, setAvailableCharactersOpponent] = useState<Character[]>([])

  // Armazenar os personagens selecionados em cada posição específica
  const [pickSlots, setPickSlots] = useState<{
    [key: number]: Character | null
  }>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    10: null,
    11: null,
    12: null,
    13: null,
    14: null,
    15: null,
    16: null,
  })

  // Referências para o draft atual
  const isInitializedRef = useRef<boolean>(false);

  // Obter decks para seleção
  const decks = getDecks()

  // Definir a ordem exata de picks e bans
  const pickOrder = [
    // Banimentos iniciais
    { number: 1, type: "ban", player: "player1" },
    { number: 2, type: "ban", player: "player2" },

    // Picks iniciais
    { number: 3, type: "pick", player: "player1" },
    { number: 4, type: "pick", player: "player2" },
    { number: 5, type: "pick", player: "player1" },
    { number: 6, type: "pick", player: "player2" },
    { number: 7, type: "pick", player: "player1" },
    { number: 8, type: "pick", player: "player2" },

    // Banimentos do meio
    { number: 9, type: "ban", player: "player1" },
    { number: 10, type: "ban", player: "player2" },
    
    // Picks finais
    { number: 11, type: "pick", player: "player2" },
    { number: 12, type: "pick", player: "player1" },
    { number: 13, type: "pick", player: "player2" },
    { number: 14, type: "pick", player: "player1" },
    { number: 15, type: "pick", player: "player2" },
    { number: 16, type: "pick", player: "player1" },
  ]

  // Set draft ID as soon as component mounts
  useEffect(() => {
    setDraftId(params.id)
  }, [params.id])

  // Verificar autenticação e carregar draft
  useEffect(() => {
    if (authLoading || !draftId) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Carregar o draft se o usuário estiver autenticado
    const loadDraft = async () => {
      try {
        if (!isInitializedRef.current) {
          const loadedDraft = await getDraftById(draftId);
          
          if (!loadedDraft) {
            setFetchError("Draft não encontrado");
            return;
          }

          // Verificar se o usuário atual é um dos jogadores ou se pode entrar
          const isPlayer1 = loadedDraft.player1.id === user?.id;
          const isPlayer2 = loadedDraft.player2.id === user?.id;
          
          if (!isPlayer1 && !isPlayer2) {
            // Se o jogador 2 ainda não foi definido, permitir entrar
            if (!loadedDraft.player2.id) {
              const joined = await joinDraft(draftId);
              if (!joined) {
                setFetchError("Não foi possível entrar neste draft");
                return;
              }
            } else {
              setFetchError("Você não é um participante deste draft");
              return;
            }
          }
          
          // Buscar detalhes dos decks
          const { data: draftDetails } = await supabase
            .from('draft_details')
            .select('*')
            .eq('draft_id', draftId)
            .single();
            
          if (draftDetails) {
            // Carregar deck do jogador
            const playerDeckId = isPlayer1 ? draftDetails.player1_deck_id : draftDetails.player2_deck_id;
            const opponentDeckId = isPlayer1 ? draftDetails.player2_deck_id : draftDetails.player1_deck_id;
            
            if (playerDeckId) {
              const playerDeck = decks.find(d => d.id === playerDeckId);
              if (playerDeck) {
                setSelectedDeck(playerDeck);
              }
            }
            
            if (opponentDeckId) {
              const oppDeck = decks.find(d => d.id === opponentDeckId);
              if (oppDeck) {
                setOpponentDeck(oppDeck);
              }
            }
            
            // Se o jogador ainda não selecionou um deck, mostrar seletor
            setIsDeckSelectorOpen(!playerDeckId);
          } else {
            // Se não há detalhes, mostrar seletor para o jogador escolher um deck
            setIsDeckSelectorOpen(true);
          }
          
          isInitializedRef.current = true;
        }
      } catch (err) {
        console.error("Erro ao carregar draft:", err);
        setFetchError(err instanceof Error ? err.message : "Erro ao carregar draft");
      }
    };

    loadDraft();
  }, [authLoading, isAuthenticated, router, user, draftId, getDraftById, joinDraft, decks]);

  // Quando um deck é selecionado, carregamos os personagens disponíveis
  useEffect(() => {
    if (selectedDeck) {
      const deckCharacters = selectedDeck.characters
        .map((id) => characters.find((c) => c.id === id))
        .filter(Boolean) as Character[]

      setAvailableCharacters(deckCharacters)
    }

    if (opponentDeck) {
      const opponentDeckCharacters = opponentDeck.characters
        .map((id) => characters.find((c) => c.id === id))
        .filter(Boolean) as Character[]

      setAvailableCharactersOpponent(opponentDeckCharacters)
    }
  }, [selectedDeck, opponentDeck, characters])

  // Quando o draft mudar, atualizar os slots de picks/bans com os personagens corretos
  useEffect(() => {
    if (!draft || !characters.length) return;
    
    // Resetar os slots
    const newPickSlots: {[key: number]: Character | null} = {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
      9: null,
      10: null,
      11: null,
      12: null,
      13: null,
      14: null,
      15: null,
      16: null,
    };
    
    // Processar os banimentos iniciais
    draft.prebans.forEach((characterId, index) => {
      const character = characters.find(c => c.id === characterId);
      if (character) {
        // Banimentos iniciais vão para os slots 1 (player1) e 2 (player2)
        const slotNumber = index + 1;
        if (slotNumber <= 2) {
          newPickSlots[slotNumber] = character;
        }
      }
    });
    
    // Processar os picks do jogador 1
    draft.picks.player1.forEach((characterId, index) => {
      const character = characters.find(c => c.id === characterId);
      if (character) {
        // Determinar em qual slot colocar baseado no índice e na ordem de picks
        const player1Slots = [3, 5, 7, 12, 14, 16];
        if (index < player1Slots.length) {
          newPickSlots[player1Slots[index]] = character;
        }
      }
    });
    
    // Processar os picks do jogador 2
    draft.picks.player2.forEach((characterId, index) => {
      const character = characters.find(c => c.id === characterId);
      if (character) {
        // Determinar em qual slot colocar baseado no índice e na ordem de picks
        const player2Slots = [4, 6, 8, 11, 13, 15];
        if (index < player2Slots.length) {
          newPickSlots[player2Slots[index]] = character;
        }
      }
    });
    
    // Processar os banimentos do meio
    if (draft.player1.bans && draft.player1.bans.length > 0) {
      const characterId = draft.player1.bans[0];
      const character = characters.find(c => c.id === characterId);
      if (character) {
        newPickSlots[9] = character;
      }
    }
    
    if (draft.player2.bans && draft.player2.bans.length > 0) {
      const characterId = draft.player2.bans[0];
      const character = characters.find(c => c.id === characterId);
      if (character) {
        newPickSlots[10] = character;
      }
    }
    
    setPickSlots(newPickSlots);
  }, [draft, characters]);

  // Timer para o turno
  useEffect(() => {
    if (draft && !draft.completed) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            if (additionalTimeLeft > 0) {
              setAdditionalTimeLeft((prevAdd) => prevAdd - 1)
              return 0
            }
            // Auto skip turn if time runs out
            // Implementação futura: adicionar skip automático
            return 45
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [draft])

  // Reset timer when turn changes
  useEffect(() => {
    if (draft) {
      setTimeLeft(45)
    }
  }, [draft?.turn])

  // Lidar com a seleção de deck
  const handleSelectDeck = async (deck: Deck) => {
    setSelectedDeck(deck)
    setIsDeckSelectorOpen(false)
    
    if (!draft) return;
    
    // Determinar qual campo atualizar com base em quem é o usuário
    const isPlayer1 = draft.player1.id === user?.id;
    const deckField = isPlayer1 ? 'player1_deck_id' : 'player2_deck_id';
    
    try {
      // Atualizar o deck no banco de dados
      await supabase
        .from('draft_details')
        .update({ [deckField]: deck.id })
        .eq('draft_id', draftId);
      
      // Se o outro jogador já selecionou um deck, começar o draft
      const { data } = await supabase
        .from('draft_details')
        .select('*')
        .eq('draft_id', draftId)
        .single();
        
      if (data && data.player1_deck_id && data.player2_deck_id) {
        // Ambos os jogadores selecionaram decks, atualizar status
        await supabase
          .from('draft_details')
          .update({ status: 'active' })
          .eq('draft_id', draftId);
      }
    } catch (error) {
      console.error("Erro ao selecionar deck:", error);
    }
  }

  // Verificar se um personagem já foi selecionado
  const isCharacterSelected = (character: Character) => {
    return Object.values(pickSlots).some((char) => char !== null && char.id === character.id)
  }

  // Obter o número do slot onde o personagem está
  const getSlotForCharacter = (character: Character) => {
    for (const [slot, char] of Object.entries(pickSlots)) {
      if (char !== null && char.id === character.id) {
        return Number.parseInt(slot)
      }
    }
    return null
  }

  // Verificar se é um slot de ban
  const isBanSlot = (slotNumber: number) => {
    return [1, 2, 9, 10].includes(slotNumber)
  }

  // Verificar se é um slot do jogador 1
  const isPlayer1Slot = (slotNumber: number) => {
    return [1, 3, 5, 7, 9, 12, 14, 16].includes(slotNumber)
  }

  // Verificar se é um slot do jogador 2
  const isPlayer2Slot = (slotNumber: number) => {
    return [2, 4, 6, 8, 10, 11, 13, 15].includes(slotNumber)
  }

  // Verificar se é minha vez
  const isMyTurn = () => {
    if (!draft || !user) return false;
    
    const isPlayer1 = draft.player1.id === user.id;
    const isPlayer2 = draft.player2.id === user.id;
    
    return (isPlayer1 && draft.turn === "player1") || (isPlayer2 && draft.turn === "player2");
  }

  // Sou jogador 1 ou 2?
  const getMyPlayerNumber = (): "player1" | "player2" | null => {
    if (!draft || !user) return null;
    
    if (draft.player1.id === user.id) return "player1";
    if (draft.player2.id === user.id) return "player2";
    
    return null;
  }

  // Manipular seleção de personagem
  const handleCharacterSelect = async (character: Character) => {
    // Verificar se o draft está ativo e se é minha vez
    if (!draft || !isMyTurn() || draft.completed) {
      return;
    }
    
    // Verificar se o personagem já foi selecionado
    if (isCharacterSelected(character)) {
      return;
    }
    
    const myPlayerNumber = getMyPlayerNumber();
    if (!myPlayerNumber) return;
    
    try {
      let success = false;
      
      // Determinar ação com base na fase atual
      if (draft.phase === "ban" || draft.phase === "preban") {
        success = await makeBan(character.id);
      } else if (draft.phase === "pick") {
        success = await makePick(character.id);
      }
      
      if (!success) {
        console.error("Não foi possível fazer a ação");
      }
    } catch (error) {
      console.error("Erro ao selecionar personagem:", error);
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Get element icon
  const getElementIcon = (element: string) => {
    switch (element) {
      case "Fusão":
        return <Flame className="h-4 w-4 text-orange-400" />
      case "Glacio":
        return <Snowflake className="h-4 w-4 text-blue-400" />
      case "Aero":
        return <Wind className="h-4 w-4 text-teal-400" />
      case "Eletro":
        return <Zap className="h-4 w-4 text-purple-400" />
      case "Espectro":
        return <Sun className="h-4 w-4 text-yellow-400" />
      case "Devastação":
        return <Target className="h-4 w-4 text-pink-400" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  // Filter characters by element
  const filteredCharacters = activeFilter
    ? availableCharacters.filter((char) => char.element === activeFilter)
    : availableCharacters

  const filteredCharactersOpponent = activeFilterOpponent
    ? availableCharactersOpponent.filter((char) => char.element === activeFilterOpponent)
    : availableCharactersOpponent

  // Mostrar carregamento
  if (authLoading || draftLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Carregando draft...</p>
        </div>
      </div>
    );
  }
  
  // Mostrar erro
  if (fetchError || error) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {fetchError || (error instanceof Error ? error.message : "Erro desconhecido")}
            </AlertDescription>
          </Alert>
          <Button 
            className="mt-4 w-full" 
            onClick={() => router.push("/draft/create")}
          >
            Voltar para Criar Draft
          </Button>
        </div>
      </div>
    );
  }

  // Renderizar seletor de deck
  if (isDeckSelectorOpen) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Selecione um Deck para o Torneio</h1>

          {decks.length === 0 ? (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
              <p className="text-lg mb-4">Você não possui nenhum deck de torneio.</p>
              <Button onClick={() => router.push("/teams")}>Criar um Deck</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks.map((deck) => {
                const deckCharacters = deck.characters
                  .map((id) => characters.find((c) => c.id === id))
                  .filter(Boolean) as Character[]

                return (
                  <div
                    key={deck.id}
                    className="bg-gray-800 border border-yellow-600/30 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSelectDeck(deck as Deck)}
                  >
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 mr-2 text-yellow-500" />
                      <h3 className="text-lg font-bold">{deck.name}</h3>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span>{deckCharacters.length} personagens</span>
                      <span>Custo: {deck.totalCost}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                      {deckCharacters.slice(0, 5).map((character) => (
                        <div key={character.id} className="aspect-square bg-gray-900 rounded overflow-hidden">
                          {character.imagePath && (
                            <Image
                              src={character.imagePath || "/placeholder.svg"}
                              alt={character.name}
                              width={60}
                              height={60}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                      {deckCharacters.length > 5 && (
                        <div className="aspect-square bg-gray-900 rounded flex items-center justify-center">
                          <span>+{deckCharacters.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Se o draft não foi carregado, mostrar mensagem
  if (!draft) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Draft não encontrado ou você não tem permissão para acessá-lo.</p>
          <Button 
            className="mt-4" 
            onClick={() => router.push("/draft/create")}
          >
            Voltar para Criar Draft
          </Button>
        </div>
      </div>
    );
  }

  // Renderizar a ordem de picks (exatamente como na imagem)
  const renderPickOrder = () => {
    // Exatamente como na imagem:
    // Primeira linha: 7, 5, 3, 1, 2, 4, 6, 8
    // Segunda linha: 16, 14, 12, 9, 10, 11, 13, 15
    const firstRow = [7, 5, 3, 1, 2, 4, 6, 8]
    const secondRow = [16, 14, 12, 9, 10, 11, 13, 15]

    // Determinar o índice do pick atual
    const getCurrentPickIndex = () => {
      if (!draft) return -1;
      
      if (draft.phase === "preban") {
        // Durante pré-bans, mostrar slot 1 ou 2 dependendo do turno
        return draft.turn === "player1" ? 0 : 1;
      } else if (draft.phase === "ban") {
        // Durante bans do meio, mostrar slot 9 ou 10
        return draft.turn === "player1" ? 9 : 10;
      } else if (draft.phase === "pick") {
        // Durante picks, determinar com base no turno e no número do pick atual
        const player1Picks = [3, 5, 7, 12, 14, 16];
        const player2Picks = [4, 6, 8, 11, 13, 15];
        
        if (draft.turn === "player1") {
          return player1Picks[draft.currentPick] || -1;
        } else {
          return player2Picks[draft.currentPick] || -1;
        }
      }
      
      return -1;
    };
    
    const currentPickNumber = getCurrentPickIndex();

    return (
      <div className="flex flex-col items-center mb-4">
        <div className="flex justify-center gap-1 mb-1">
          {firstRow.map((num, index) => {
            const isBan = isBanSlot(num)
            const isPlayer1 = isPlayer1Slot(num)
            const isPlayer2 = isPlayer2Slot(num)
            const isHighlighted = [1, 2].includes(num)
            const isCurrentPick = num === currentPickNumber
            const character = pickSlots[num]
            
            // Add margin between 1 and 2
            const shouldAddMarginRight = num === 1
            const shouldAddMarginLeft = num === 2

            return (
              <div
                key={`pick-${num}`}
                className={`
                  w-16 h-16 rounded-md flex items-center justify-center text-3xl font-bold relative
                  ${isHighlighted ? "bg-red-500 text-white" : "bg-gray-800"}
                  ${isPlayer1 && !isBan ? "text-blue-500" : ""}
                  ${isPlayer2 && !isBan ? "text-red-500" : ""}
                  ${!isPlayer1 && !isPlayer2 && !isBan ? "text-gray-500" : ""}
                  ${isCurrentPick ? "ring-2 ring-white" : ""}
                  ${shouldAddMarginRight ? "mr-3" : ""}
                  ${shouldAddMarginLeft ? "ml-3" : ""}
                `}
              >
                {character ? (
                  <div className="absolute inset-0 rounded-md overflow-hidden">
                    <Image
                      src={character.imagePath || "/placeholder.svg"}
                      alt={character.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                    {isBan && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <Ban className="h-8 w-8 text-red-500" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-center text-xs py-1">
                      {character.name}
                    </div>
                  </div>
                ) : (
                  num
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-center gap-1">
          {secondRow.map((num) => {
            const isBan = isBanSlot(num)
            const isPlayer1 = isPlayer1Slot(num)
            const isPlayer2 = isPlayer2Slot(num)
            const isHighlighted = [9, 10].includes(num)
            const isCurrentPick = num === currentPickNumber
            const character = pickSlots[num]
            
            // Add margin between 9 and 10
            const shouldAddMarginRight = num === 9
            const shouldAddMarginLeft = num === 10

            return (
              <div
                key={`pick-${num}`}
                className={`
                  w-16 h-16 rounded-md flex items-center justify-center text-3xl font-bold relative
                  ${isHighlighted ? "bg-red-500 text-white" : "bg-gray-800"}
                  ${isPlayer1 && !isBan ? "text-blue-500" : ""}
                  ${isPlayer2 && !isBan ? "text-red-500" : ""}
                  ${!isPlayer1 && !isPlayer2 && !isBan ? "text-gray-500" : ""}
                  ${isCurrentPick ? "ring-2 ring-white" : ""}
                  ${shouldAddMarginRight ? "mr-3" : ""}
                  ${shouldAddMarginLeft ? "ml-3" : ""}
                `}
              >
                {character ? (
                  <div className="absolute inset-0 rounded-md overflow-hidden">
                    <Image
                      src={character.imagePath || "/placeholder.svg"}
                      alt={character.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                    {isBan && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <Ban className="h-8 w-8 text-red-500" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-center text-xs py-1">
                      {character.name}
                    </div>
                  </div>
                ) : (
                  num
                )}
              </div>
            )
          })}
        </div>
        <div className="text-center mt-2 text-xl font-bold">PICKS</div>
      </div>
    )
  }

  // Renderizar mensagem de fase atual
  const renderPhaseMessage = () => {
    if (!draft) return "";
    
    if (draft.completed) {
      return "Draft completo!";
    }

    const playerName = draft.turn === "player1" ? draft.player1.name : draft.player2.name;
    const isMyTurnNow = isMyTurn();
    let actionType = "escolher";
    
    if (draft.phase === "preban") {
      actionType = "banir (fase inicial)";
    } else if (draft.phase === "ban") {
      actionType = "banir (fase do meio)";
    } else {
      actionType = "escolher";
    }
    
    if (isMyTurnNow) {
      return `Sua vez de ${actionType} um personagem...`;
    } else {
      return `Vez de ${playerName} ${actionType} um personagem...`;
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header com informações dos jogadores */}
      <div className="flex justify-between items-center p-4 bg-black">
        <div className={`text-center ${draft?.turn === "player1" ? "ring-2 ring-blue-500 rounded-lg p-2 bg-blue-900/20" : "p-2"}`}>
          <div className="text-xl font-bold">{draft?.player1.name || "Jogador 1"}</div>
          <div className="text-sm text-gray-400">
            Custo do Deck: {selectedDeck?.totalCost || "N/A"}
          </div>
          <div className="flex justify-center gap-1 mt-1">
            {Array(draft?.picks.player1.length || 0)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-500" />
              ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-sm font-medium mb-1">
            {draft?.phase === "preban" ? "FASE DE PRÉ-BANIMENTO" : 
             draft?.phase === "ban" ? "FASE DE BANIMENTO" : 
             draft?.phase === "pick" ? "FASE DE SELEÇÃO" : "CONCLUÍDO"}
          </div>
          <div className="flex gap-4">
            <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white text-xl font-bold">
              {draft?.currentPick || 0}
            </div>
            <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
          </div>
          <div className="text-sm text-gray-400">{formatTime(additionalTimeLeft)}</div>
        </div>

        <div className={`text-center ${draft?.turn === "player2" ? "ring-2 ring-red-500 rounded-lg p-2 bg-red-900/20" : "p-2"}`}>
          <div className="text-xl font-bold">{draft?.player2.name || "Jogador 2"}</div>
          <div className="text-sm text-gray-400">
            Custo do Deck: {opponentDeck?.totalCost || "N/A"}
          </div>
          <div className="flex justify-center gap-1 mt-1">
            {Array(draft?.picks.player2.length || 0)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-red-500" />
              ))}
          </div>
        </div>
      </div>

      {/* Ordem de picks */}
      {renderPickOrder()}

      {/* Mensagem de fase atual */}
      <div className="flex justify-between items-center px-8 py-2">
        <div className="text-white text-lg">{renderPhaseMessage()}</div>

        <div className="flex gap-2">
          {draft?.completed && (
            <Button 
              variant="default"
              onClick={() => router.push("/draft/create")}
            >
              Criar Novo Draft
            </Button>
          )}
        </div>
      </div>

      {/* Área de seleção de personagens */}
      <div className="grid grid-cols-2 gap-4 px-4">
        {/* Lado do Jogador 1 */}
        <div className="bg-black p-2 rounded-lg">
          {/* Filtros */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter(null)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Shield")}
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Devastação")}
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Aero")}
            >
              <Wind className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Glacio")}
            >
              <Snowflake className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Fusão")}
            >
              <Flame className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Espectro")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilter("Eletro")}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid de personagens */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-1">
            {filteredCharacters.map((character) => {
              const isSelected = isCharacterSelected(character)
              const slotNumber = isSelected ? getSlotForCharacter(character) : null
              const isBan = slotNumber ? isBanSlot(slotNumber) : false
              const isCurrentTurnPlayer = draft?.turn === getMyPlayerNumber() && getMyPlayerNumber() === "player1"

              return (
                <div
                  key={character.id}
                  className={`
                    aspect-square bg-gray-800 rounded-md overflow-hidden relative cursor-pointer 
                    ${isSelected ? "opacity-50 pointer-events-none" : ""}
                    ${!isSelected && isCurrentTurnPlayer ? "hover:opacity-80" : ""}
                    ${!isCurrentTurnPlayer ? "cursor-not-allowed" : ""}
                  `}
                  onClick={() => isCurrentTurnPlayer && handleCharacterSelect(character)}
                >
                  {character.imagePath && (
                    <Image
                      src={character.imagePath || "/placeholder.svg"}
                      alt={character.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Nível e raridade */}
                  <div className="absolute top-0 left-0 w-full flex justify-between items-center p-1">
                    <span className="text-xs bg-black/60 px-1 rounded">60</span>
                    <span className="text-xs bg-black/60 px-1 rounded">MO</span>
                  </div>

                  {/* Nome do personagem */}
                  <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                    <div className="text-xs text-white truncate">{character.name}</div>
                  </div>

                  {isSelected && isBan && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <Ban className="h-8 w-8 text-red-500" />
                    </div>
                  )}

                  {isSelected && slotNumber && (
                    <div className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-500">{slotNumber}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Lado do Jogador 2 */}
        <div className="bg-black p-2 rounded-lg">
          {/* Filtros */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent(null)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Shield")}
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Devastação")}
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Aero")}
            >
              <Wind className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Glacio")}
            >
              <Snowflake className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Fusão")}
            >
              <Flame className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Espectro")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 min-w-[40px] h-8"
              onClick={() => setActiveFilterOpponent("Eletro")}
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid de personagens */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-1">
            {filteredCharactersOpponent.length > 0
              ? filteredCharactersOpponent.map((character) => {
                  const isSelected = isCharacterSelected(character)
                  const slotNumber = isSelected ? getSlotForCharacter(character) : null
                  const isBan = slotNumber ? isBanSlot(slotNumber) : false
                  const isCurrentTurnPlayer = draft?.turn === getMyPlayerNumber() && getMyPlayerNumber() === "player2"

                  return (
                    <div
                      key={character.id}
                      className={`
                        aspect-square bg-gray-800 rounded-md overflow-hidden relative cursor-pointer 
                        ${isSelected ? "opacity-50 pointer-events-none" : ""}
                        ${!isSelected && isCurrentTurnPlayer ? "hover:opacity-80" : ""}
                        ${!isCurrentTurnPlayer ? "cursor-not-allowed" : ""}
                      `}
                      onClick={() => isCurrentTurnPlayer && handleCharacterSelect(character)}
                    >
                      {character.imagePath && (
                        <Image
                          src={character.imagePath || "/placeholder.svg"}
                          alt={character.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Nível e raridade */}
                      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-1">
                        <span className="text-xs bg-black/60 px-1 rounded">60</span>
                        <span className="text-xs bg-black/60 px-1 rounded">MO</span>
                      </div>

                      {/* Nome do personagem */}
                      <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60">
                        <div className="text-xs text-white truncate">{character.name}</div>
                      </div>

                      {isSelected && isBan && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                          <Ban className="h-8 w-8 text-red-500" />
                        </div>
                      )}

                      {isSelected && slotNumber && (
                        <div className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-xs font-bold text-red-500">{slotNumber}</span>
                        </div>
                      )}
                    </div>
                  )
                })
              : // Se não houver personagens do oponente, mostrar mensagem
                <div className="col-span-full py-8 text-center">
                  <p className="text-gray-400">Aguardando oponente selecionar deck...</p>
                </div>
              }
          </div>
        </div>
      </div>
    </div>
  )
}
