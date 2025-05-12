"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import { useDraft } from "@/hooks/use-draft"
import { useTeams } from "@/hooks/use-teams"
import { Filter, Clock, Ban, SkipForward, Flame, Droplets, Wind, Zap, Leaf, Snowflake, Hexagon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const DraftPickBanInterface = () => {
  const { characters } = useCharacters()
  const { weapons } = useWeapons()
  const { teams } = useTeams()
  const {
    draftState,
    settings,
    selectCharacter,
    banCharacter,
    skipTurn,
    getCurrentPlayerName,
    getOpponentName,
    getCurrentPlayerTeam,
    getOpponentTeam,
    isCharacterBanned,
    isCharacterPicked,
    isMyTurn,
    getPickOrder,
    getPickNumberForCharacter,
    getPickColorClass,
  } = useDraft()

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [additionalTimeLeft, setAdditionalTimeLeft] = useState(180)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [showOnlyRoster, setShowOnlyRoster] = useState(true)

  useEffect(() => {
    if (draftState.phase === "pick") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            if (additionalTimeLeft > 0) {
              setAdditionalTimeLeft((prevAdd) => prevAdd - 1)
              return 0
            }
            // Auto skip turn if time runs out
            skipTurn()
            return 60
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [draftState.phase, additionalTimeLeft, skipTurn])

  // Reset timer when turn changes
  useEffect(() => {
    setTimeLeft(60)
  }, [draftState.turn])

  const filteredCharacters = characters.filter((char) => {
    // Filter by element if active
    if (activeFilter && char.element !== activeFilter) {
      return false
    }

    // Show only roster characters if enabled
    if (showOnlyRoster && selectedTeam) {
      const team = teams.find((t) => t.id === selectedTeam)
      return team ? team.characters.includes(char.id) : true
    }

    return true
  })

  const getElementIcon = (element: string) => {
    switch (element) {
      case "fire":
        return <Flame className="h-5 w-5 text-red-500" />
      case "water":
        return <Droplets className="h-5 w-5 text-blue-500" />
      case "wind":
        return <Wind className="h-5 w-5 text-teal-500" />
      case "electric":
        return <Zap className="h-5 w-5 text-yellow-500" />
      case "nature":
        return <Leaf className="h-5 w-5 text-green-500" />
      case "ice":
        return <Snowflake className="h-5 w-5 text-cyan-500" />
      default:
        return <Hexagon className="h-5 w-5 text-purple-500" />
    }
  }

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const renderPickNumbers = () => {
    const pickOrder = getPickOrder()
    const rows = [
      [7, 6, 3, 1, 2, 4, 5, 8],
      [16, 13, 12, 9, 10, 11, 14, 15],
    ]

    return (
      <div className="mb-4 mt-2">
        <div className="text-center font-bold text-white mb-2">PICKS</div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2 mb-2">
            {row.map((num) => {
              const isCurrentPick = draftState.currentPick === num
              const colorClass = getPickColorClass(num)

              return (
                <div
                  key={num}
                  className={`
                    w-12 h-12 rounded-md flex items-center justify-center text-2xl font-bold
                    ${isCurrentPick ? "border-2 border-white" : "border border-gray-600"}
                    ${colorClass}
                  `}
                >
                  {num}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const renderCharacterGrid = (side: "left" | "right") => {
    const filteredChars = filteredCharacters.filter((_, index) => {
      return side === "left" ? index % 2 === 0 : index % 2 === 1
    })

    return (
      <div className="grid grid-cols-4 gap-2 p-2">
        {filteredChars.map((char) => {
          const isBanned = isCharacterBanned(char.id)
          const isPicked = isCharacterPicked(char.id)
          const pickNumber = getPickNumberForCharacter(char.id)
          const colorClass = pickNumber ? getPickColorClass(pickNumber) : ""
          const equippedWeapon = weapons.find((w) => w.equippedTo === char.id)

          return (
            <div
              key={char.id}
              className={`
                relative rounded-md overflow-hidden cursor-pointer
                ${isBanned ? "opacity-50" : ""}
                ${isPicked ? "ring-2 " + colorClass : ""}
              `}
              onClick={() => {
                if (!isBanned && !isPicked && isMyTurn()) {
                  if (draftState.phase === "preban") {
                    banCharacter(char.id)
                  } else if (draftState.phase === "pick") {
                    selectCharacter(char.id)
                  }
                }
              }}
            >
              <img src={`/characters/${char.id}.webp`} alt={char.name} className="w-full h-auto object-cover" />

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
                  <span className={`text-xs font-bold ${colorClass.replace("bg-", "text-")}`}>{pickNumber}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderElementFilters = (side: "left" | "right") => {
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
        <Button
          variant={showOnlyRoster ? "default" : "outline"}
          size="icon"
          className="w-8 h-8"
          onClick={() => setShowOnlyRoster(!showOnlyRoster)}
        >
          <Filter className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  const renderPlayerInfo = (isPlayer1: boolean) => {
    const playerName = isPlayer1 ? getCurrentPlayerName() : getOpponentName()
    const team = isPlayer1 ? getCurrentPlayerTeam() : getOpponentTeam()
    const agentCost = team.characters.reduce((total, charId) => {
      const char = characters.find((c) => c.id === charId)
      return total + (char ? settings.characterCosts[charId] || (char.rarity === 5 ? 10 : 5) : 0)
    }, 0)

    const engineCost = team.characters.reduce((total, charId) => {
      const char = characters.find((c) => c.id === charId)
      const weapon = weapons.find((w) => w.equippedTo === charId)
      return total + (weapon ? settings.weaponCosts[weapon.id] || (weapon.rarity === 5 ? 4 : 2) : 0)
    }, 0)

    return (
      <div className="text-center mb-2">
        <div className="text-xl font-bold text-white">{playerName}</div>
        <div className="flex justify-between text-sm text-gray-300">
          <span>Agent costs: {agentCost}</span>
          <span>Engine costs: {engineCost}</span>
        </div>
        <div className="flex justify-center gap-1 mt-1">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < 7 ? "bg-gray-500" : "bg-red-500"}`} />
            ))}
        </div>
      </div>
    )
  }

  const renderActionButtons = () => {
    if (draftState.phase === "preban") {
      return (
        <Button className="w-full mt-2" onClick={() => banCharacter("")} disabled={!isMyTurn()}>
          Ban
        </Button>
      )
    }

    if (draftState.phase === "pick") {
      return (
        <Button className="w-full mt-2" onClick={skipTurn} disabled={!isMyTurn()}>
          <SkipForward className="mr-2 h-4 w-4" />
          Skip turn
        </Button>
      )
    }

    return null
  }

  const renderTeamSelector = () => {
    const myTeams = teams.filter((team) => team.characters.length >= 15)

    if (myTeams.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-800 rounded-md">
          <p className="text-white mb-2">Você precisa criar um deck com pelo menos 15 personagens</p>
          <Button variant="default" onClick={() => (window.location.href = "/teams/create")}>
            Criar Deck
          </Button>
        </div>
      )
    }

    return (
      <div className="p-4 bg-gray-800 rounded-md">
        <h3 className="text-white font-bold mb-2">Selecione seu Deck</h3>
        <div className="grid grid-cols-2 gap-2">
          {myTeams.map((team) => (
            <Button
              key={team.id}
              variant={selectedTeam === team.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleSelectTeam(team.id)}
            >
              <span className="truncate">{team.name}</span>
              <span className="ml-auto text-xs">{team.characters.length}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>{renderPlayerInfo(true)}</div>
        <div>{renderPlayerInfo(false)}</div>
      </div>

      {renderPickNumbers()}

      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          <Clock className="inline-block mr-2" />
          {formatTime(timeLeft)}
        </div>

        <div className="text-center">
          {draftState.phase === "preban" && <span className="text-white font-bold">Please ban an agent...</span>}
          {draftState.phase === "pick" && <span className="text-white font-bold">PICKS</span>}
        </div>

        <div className="text-white">Additional time: {formatTime(additionalTimeLeft)}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {renderElementFilters("left")}
          {renderCharacterGrid("left")}
        </div>
        <div>
          {renderElementFilters("right")}
          {renderCharacterGrid("right")}
        </div>
      </div>

      <div className="mt-4">
        {renderTeamSelector()}
        {renderActionButtons()}
      </div>
    </div>
  )
}
