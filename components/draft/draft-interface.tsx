"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import { useCosts } from "@/hooks/use-costs"
import { Ban, Clock, Filter, Shield, Zap, Droplets, Wind, Flame, Leaf, Snowflake } from "lucide-react"
import type { Character } from "@/types/character"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const DraftInterface = () => {
  const { characters } = useCharacters()
  const { weapons } = useWeapons()
  const { calculateCharacterCost, calculateWeaponCost } = useCosts()

  // Draft state
  const [enablePrebans, setEnablePrebans] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<"preban" | "pick" | "ban" | "complete">("preban")
  const [currentTurn, setCurrentTurn] = useState<"player1" | "player2">("player1")
  const [currentPickNumber, setCurrentPickNumber] = useState(1)
  const [timeLeft, setTimeLeft] = useState(45)
  const [additionalTimeLeft, setAdditionalTimeLeft] = useState(230)

  // Characters state
  const [prebans, setPrebans] = useState<{ player1: Character[]; player2: Character[] }>({
    player1: [],
    player2: [],
  })
  const [picks, setPicks] = useState<{ player1: Character[]; player2: Character[] }>({
    player1: [],
    player2: [],
  })
  const [bans, setBans] = useState<{ player1: Character[]; player2: Character[] }>({
    player1: [],
    player2: [],
  })

  // UI state
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [player1Name, setPlayer1Name] = useState("DASDSAD")
  const [player2Name, setPlayer2Name] = useState("SDSADAS")
  const [player1AgentCost, setPlayer1AgentCost] = useState(1618)
  const [player2AgentCost, setPlayer2AgentCost] = useState(1618)
  const [player1EngineCost, setPlayer1EngineCost] = useState(434)
  const [player2EngineCost, setPlayer2EngineCost] = useState(434)

  // Timer effect
  useEffect(() => {
    if (currentPhase !== "complete") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            if (additionalTimeLeft > 0) {
              setAdditionalTimeLeft((prevAdd) => prevAdd - 1)
              return 0
            }
            // Auto skip turn if time runs out
            handleSkipTurn()
            return 45
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentPhase, additionalTimeLeft])

  // Reset timer when turn changes
  useEffect(() => {
    setTimeLeft(45)
  }, [currentTurn, currentPickNumber])

  // Get the pick order based on the current pick number
  const getPickOrder = () => {
    // First row: 7, 6, 3, 1, 2, 4, 5, 8
    // Second row: 16, 13, 12, 9, 10, 11, 14, 15
    const firstRow = [7, 5, 3, 1, 2, 4, 6, 8]
    const secondRow = [16, 13, 11, 9, 10, 12, 14, 15]
    return [...firstRow, ...secondRow]
  }

  // Get the pick order based on the current pick number (alternative version)
  const getPickOrderAlt = () => {
    // First row: 11, 10, 7, 5, 6, 8, 9, 12
    // Second row: 20, 17, 16, 13, 14, 15, 18, 19
    const firstRow = [11, 9, 7, 5, 6, 8, 10, 12]
    const secondRow = [19, 17, 15, 13, 14, 16, 18, 20]
    return [...firstRow, ...secondRow]
  }

  // Check if a character is banned
  const isCharacterBanned = (character: Character) => {
    return (
      prebans.player1.some((c) => c.id === character.id) ||
      prebans.player2.some((c) => c.id === character.id) ||
      bans.player1.some((c) => c.id === character.id) ||
      bans.player2.some((c) => c.id === character.id)
    )
  }

  // Check if a character is picked
  const isCharacterPicked = (character: Character) => {
    return picks.player1.some((c) => c.id === character.id) || picks.player2.some((c) => c.id === character.id)
  }

  // Get the pick number for a character
  const getPickNumberForCharacter = (character: Character) => {
    const pickOrder = getPickOrder()
    const player1Picks = picks.player1
    const player2Picks = picks.player2

    for (let i = 0; i < player1Picks.length; i++) {
      if (player1Picks[i].id === character.id) {
        return pickOrder[i * 2]
      }
    }

    for (let i = 0; i < player2Picks.length; i++) {
      if (player2Picks[i].id === character.id) {
        return pickOrder[i * 2 + 1]
      }
    }

    return null
  }

  // Get the color class for a pick number
  const getPickColorClass = (pickNumber: number) => {
    // Red picks: 1, 2, 9, 10, 13, 14
    // Blue picks: 3, 4, 11, 12, 15, 16
    const redPicks = [1, 2, 9, 10, 13, 14, 5, 6]
    const bluePicks = [3, 4, 11, 12, 15, 16, 7, 8]

    if (redPicks.includes(pickNumber)) {
      return "border-red-500 text-red-500"
    } else if (bluePicks.includes(pickNumber)) {
      return "border-blue-500 text-blue-500"
    }

    return ""
  }

  // Get the background color class for a pick number
  const getPickBgColorClass = (pickNumber: number) => {
    // Red picks: 1, 2, 9, 10, 13, 14
    // Blue picks: 3, 4, 11, 12, 15, 16
    const redPicks = [1, 2, 9, 10, 13, 14, 5, 6]
    const bluePicks = [3, 4, 11, 12, 15, 16, 7, 8]

    if (redPicks.includes(pickNumber)) {
      return "bg-red-500 text-white"
    } else if (bluePicks.includes(pickNumber)) {
      return "bg-blue-500 text-white"
    }

    return "bg-gray-700 text-gray-300"
  }

  // Handle character selection
  const handleCharacterSelect = (character: Character) => {
    if (isCharacterBanned(character) || isCharacterPicked(character)) {
      return
    }

    if (currentPhase === "preban") {
      // Add to prebans
      if (currentTurn === "player1") {
        if (prebans.player1.length < 2) {
          setPrebans({
            ...prebans,
            player1: [...prebans.player1, character],
          })
          setCurrentTurn("player2")
        }
      } else {
        if (prebans.player2.length < 2) {
          setPrebans({
            ...prebans,
            player2: [...prebans.player2, character],
          })
          setCurrentTurn("player1")
        }

        // Check if prebans are complete
        if (prebans.player1.length === 2 && prebans.player2.length === 1) {
          setCurrentPhase("pick")
          setCurrentTurn("player1")
          setCurrentPickNumber(1)
        }
      }
    } else if (currentPhase === "pick") {
      // Add to picks based on the current pick number
      if (currentPickNumber <= 8) {
        if (currentTurn === "player1") {
          setPicks({
            ...picks,
            player1: [...picks.player1, character],
          })
          setCurrentTurn("player2")
        } else {
          setPicks({
            ...picks,
            player2: [...picks.player2, character],
          })
          setCurrentTurn("player1")
          setCurrentPickNumber((prev) => prev + 1)
        }

        // Check if first pick phase is complete
        if (currentPickNumber === 4 && currentTurn === "player2") {
          setCurrentPhase("ban")
          setCurrentTurn("player1")
        }
      }
    } else if (currentPhase === "ban") {
      // Add to bans
      if (currentTurn === "player1") {
        setBans({
          ...bans,
          player1: [...bans.player1, character],
        })
        setCurrentTurn("player2")
      } else {
        setBans({
          ...bans,
          player2: [...bans.player2, character],
        })
        setCurrentPhase("pick")
        setCurrentTurn("player1")
        setCurrentPickNumber(5)
      }
    }
  }

  // Handle skip turn
  const handleSkipTurn = () => {
    if (currentTurn === "player1") {
      setCurrentTurn("player2")
    } else {
      setCurrentTurn("player1")
      if (currentPhase === "pick") {
        setCurrentPickNumber((prev) => prev + 1)
      }
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
      case "fire":
        return <Flame className="h-4 w-4 text-red-500" />
      case "water":
        return <Droplets className="h-4 w-4 text-blue-500" />
      case "wind":
        return <Wind className="h-4 w-4 text-teal-500" />
      case "electric":
        return <Zap className="h-4 w-4 text-yellow-500" />
      case "nature":
        return <Leaf className="h-4 w-4 text-green-500" />
      case "ice":
        return <Snowflake className="h-4 w-4 text-cyan-500" />
      default:
        return <Shield className="h-4 w-4 text-purple-500" />
    }
  }

  // Filter characters by element
  const filteredCharacters = activeFilter ? characters.filter((char) => char.element === activeFilter) : characters

  // Render prebans section
  const renderPrebans = () => {
    if (!enablePrebans) return null

    return (
      <div className="mb-4">
        <div className="text-center text-sm font-bold uppercase mb-2">Prebans</div>
        <div className="flex justify-center gap-4">
          <div className="flex gap-1">
            {Array.from({ length: 2 }).map((_, index) => {
              const preban = prebans.player1[index]
              return (
                <div
                  key={`preban-p1-${index}`}
                  className="w-12 h-12 rounded-md overflow-hidden border border-purple-500 bg-gray-800"
                >
                  {preban ? (
                    <img
                      src={`/characters/${preban.id}.webp`}
                      alt={preban.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-500">{index + 1}</div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 2 }).map((_, index) => {
              const preban = prebans.player2[index]
              return (
                <div
                  key={`preban-p2-${index}`}
                  className="w-12 h-12 rounded-md overflow-hidden border border-purple-500 bg-gray-800"
                >
                  {preban ? (
                    <img
                      src={`/characters/${preban.id}.webp`}
                      alt={preban.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-500">{index + 1}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Render pick order
  const renderPickOrder = () => {
    const pickOrder = getPickOrder()
    const pickOrderAlt = getPickOrderAlt()
    const rows = [
      [pickOrder[0], pickOrder[1], pickOrder[2], pickOrder[3], pickOrder[4], pickOrder[5], pickOrder[6], pickOrder[7]],
      [
        pickOrder[8],
        pickOrder[9],
        pickOrder[10],
        pickOrder[11],
        pickOrder[12],
        pickOrder[13],
        pickOrder[14],
        pickOrder[15],
      ],
    ]
    const rowsAlt = [
      [
        pickOrderAlt[0],
        pickOrderAlt[1],
        pickOrderAlt[2],
        pickOrderAlt[3],
        pickOrderAlt[4],
        pickOrderAlt[5],
        pickOrderAlt[6],
        pickOrderAlt[7],
      ],
      [
        pickOrderAlt[8],
        pickOrderAlt[9],
        pickOrderAlt[10],
        pickOrderAlt[11],
        pickOrderAlt[12],
        pickOrderAlt[13],
        pickOrderAlt[14],
        pickOrderAlt[15],
      ],
    ]

    return (
      <div className="mb-4">
        <div className="text-center text-sm font-bold uppercase mb-2">Picks</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            {rows.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex justify-center gap-1 mb-1">
                {row.map((num) => {
                  const isCurrentPick = currentPickNumber === Math.ceil(num / 2)
                  const colorClass = getPickColorClass(num)
                  const bgColorClass = getPickBgColorClass(num)

                  return (
                    <div
                      key={`pick-${num}`}
                      className={`
                        w-10 h-10 rounded-md flex items-center justify-center text-xl font-bold
                        ${isCurrentPick ? "ring-2 ring-white" : ""}
                        ${num % 2 === 1 ? bgColorClass : "bg-gray-800 text-gray-500"}
                      `}
                    >
                      {num}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div>
            {rowsAlt.map((row, rowIndex) => (
              <div key={`row-alt-${rowIndex}`} className="flex justify-center gap-1 mb-1">
                {row.map((num) => {
                  const isCurrentPick = currentPickNumber === Math.ceil(num / 2)
                  const colorClass = getPickColorClass(num)
                  const bgColorClass = getPickBgColorClass(num)

                  return (
                    <div
                      key={`pick-alt-${num}`}
                      className={`
                        w-10 h-10 rounded-md flex items-center justify-center text-xl font-bold
                        ${isCurrentPick ? "ring-2 ring-white" : ""}
                        ${num % 2 === 0 ? bgColorClass : "bg-gray-800 text-gray-500"}
                      `}
                    >
                      {num}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render picks section
  const renderPicks = () => {
    return (
      <div className="mb-4">
        <div className="text-center text-sm font-bold uppercase mb-2">Current Picks</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 8 }).map((_, index) => {
                const pick = picks.player1[index]
                const isBanned = index === 4 // 5th pick is a ban

                return (
                  <div
                    key={`pick-p1-${index}`}
                    className={`
                      w-16 h-16 rounded-md overflow-hidden 
                      ${isBanned ? "border-2 border-red-500" : "border border-gray-700"}
                      ${pick ? "bg-gray-800" : "bg-gray-900"}
                    `}
                  >
                    {pick ? (
                      <div className="relative w-full h-full">
                        <img
                          src={`/characters/${pick.id}.webp`}
                          alt={pick.name}
                          className="w-full h-full object-cover"
                        />
                        {isBanned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <Ban className="h-8 w-8 text-red-500" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">{index + 1}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 8 }).map((_, index) => {
                const pick = picks.player2[index]
                const isBanned = index === 4 // 5th pick is a ban

                return (
                  <div
                    key={`pick-p2-${index}`}
                    className={`
                      w-16 h-16 rounded-md overflow-hidden 
                      ${isBanned ? "border-2 border-red-500" : "border border-gray-700"}
                      ${pick ? "bg-gray-800" : "bg-gray-900"}
                    `}
                  >
                    {pick ? (
                      <div className="relative w-full h-full">
                        <img
                          src={`/characters/${pick.id}.webp`}
                          alt={pick.name}
                          className="w-full h-full object-cover"
                        />
                        {isBanned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <Ban className="h-8 w-8 text-red-500" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">{index + 1}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render player info
  const renderPlayerInfo = () => {
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold">{player1Name}</div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Agent costs: {player1AgentCost}</span>
            <span>Engine costs: {player1EngineCost}</span>
          </div>
          <div className="flex justify-center gap-1 mt-1">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < 7 ? "bg-gray-500" : "bg-red-500"}`} />
              ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{player2Name}</div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Agent costs: {player2AgentCost}</span>
            <span>Engine costs: {player2EngineCost}</span>
          </div>
          <div className="flex justify-center gap-1 mt-1">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < 7 ? "bg-gray-500" : "bg-red-500"}`} />
              ))}
          </div>
        </div>
      </div>
    )
  }

  // Render timer
  const renderTimer = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          <Clock className="inline-block mr-2" />
          {formatTime(timeLeft)}
        </div>

        <div className="text-center">
          {currentPhase === "preban" && <span className="text-white font-bold">Please ban an agent...</span>}
          {currentPhase === "pick" && <span className="text-white font-bold">Please pick an agent...</span>}
          {currentPhase === "ban" && <span className="text-white font-bold">Please ban an agent...</span>}
        </div>

        <div className="text-white">Additional time: {formatTime(additionalTimeLeft)}</div>
      </div>
    )
  }

  // Render element filters
  const renderElementFilters = () => {
    const elements = ["fire", "water", "wind", "electric", "nature", "ice", "physical"]

    return (
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {elements.map((element) => (
          <Button
            key={element}
            variant={activeFilter === element ? "default" : "outline"}
            size="icon"
            className="w-8 h-8"
            onClick={() => setActiveFilter(activeFilter === element ? null : element)}
          >
            {getElementIcon(element)}
          </Button>
        ))}
        <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => setActiveFilter(null)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Render character grid
  const renderCharacterGrid = (side: "left" | "right") => {
    const filteredChars = filteredCharacters.filter((_, index) => {
      return side === "left" ? index % 2 === 0 : index % 2 === 1
    })

    return (
      <div className="grid grid-cols-4 gap-1 p-2">
        {filteredChars.map((char) => {
          const isBanned = isCharacterBanned(char)
          const isPicked = isCharacterPicked(char)
          const pickNumber = isPicked ? getPickNumberForCharacter(char) : null
          const colorClass = pickNumber ? getPickColorClass(pickNumber) : ""
          const equippedWeapon = weapons.find((w) => w.equippedTo === char.id)

          return (
            <div
              key={`${side}-${char.id}`}
              className={`
                relative rounded-md overflow-hidden cursor-pointer
                ${isBanned ? "opacity-50" : ""}
                ${isPicked ? "ring-2 " + colorClass : ""}
              `}
              onClick={() => handleCharacterSelect(char)}
            >
              <img src={`/characters/${char.id}.webp`} alt={char.name} className="w-full h-full object-cover" />

              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{char.name}</span>
                  <span className="text-xs font-bold text-white">60</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">{char.rarity === 5 ? "MO" : "SR"}</span>
                  {equippedWeapon && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <img
                            src={`/weapons/${equippedWeapon.id}.webp`}
                            alt={equippedWeapon.name}
                            className="w-5 h-5 object-cover rounded-sm"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{equippedWeapon.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

              {isBanned && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <Ban className="h-10 w-10 text-red-500" />
                </div>
              )}

              {isPicked && pickNumber && (
                <div className="absolute top-1 right-1 bg-black bg-opacity-70 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className={`text-xs font-bold ${colorClass.replace("border-", "text-")}`}>{pickNumber}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Render action buttons
  const renderActionButtons = () => {
    return (
      <div className="flex justify-between mt-4">
        <div className="flex items-center gap-2">
          <Switch id="enable-prebans" checked={enablePrebans} onCheckedChange={setEnablePrebans} />
          <Label htmlFor="enable-prebans">Enable Prebans</Label>
        </div>

        <Button onClick={handleSkipTurn}>Skip Turn</Button>
      </div>
    )
  }

  return (
    <div className="w-full bg-black p-4 rounded-lg">
      {renderPlayerInfo()}
      {renderPrebans()}
      {renderPickOrder()}
      {renderTimer()}
      {renderPicks()}

      <div className="grid grid-cols-2 gap-4">
        <div>
          {renderElementFilters()}
          {renderCharacterGrid("left")}
        </div>
        <div>
          {renderElementFilters()}
          {renderCharacterGrid("right")}
        </div>
      </div>

      {renderActionButtons()}
    </div>
  )
}
