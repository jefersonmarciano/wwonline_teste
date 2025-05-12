"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { useTeams } from "@/hooks/use-teams"
import { Calendar, Trophy, Users, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import Image from "next/image"

// Tipos para o histórico
interface MatchHistory {
  id: string
  date: string
  result: "victory" | "defeat"
  teamId: string
  teamName: string
  opponentName: string
  opponentTeamName: string
  score: string
  duration: string
  characters: {
    id: string
    name: string
    imagePath?: string
  }[]
  opponentCharacters: {
    id: string
    name: string
    imagePath?: string
  }[]
}

export default function HistoryPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { teams, isLoading: teamsLoading } = useTeams()
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        // Simulando uma chamada de API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Dados fictícios para demonstração
        if (teams.length > 0) {
          const mockHistory: MatchHistory[] = [
            {
              id: "match-1",
              date: "2025-05-09T14:30:00",
              result: "victory",
              teamId: teams[0]?.id || "1",
              teamName: teams[0]?.name || "Time Principal",
              opponentName: "arthurobs2",
              opponentTeamName: "Equipe Devastação",
              score: "3-1",
              duration: "12:45",
              characters:
                teams[0]?.characters.map((char) => ({
                  id: char.id,
                  name: char.name,
                  imagePath: char.imagePath,
                })) || [],
              opponentCharacters: [
                { id: "op-1", name: "Cantarella", imagePath: "/characters/cantarela.webp" },
                { id: "op-2", name: "Rocha", imagePath: "/characters/roccia.webp" },
                { id: "op-3", name: "Camélia", imagePath: "/characters/camelia.webp" },
              ],
            },
            {
              id: "match-2",
              date: "2025-05-08T18:15:00",
              result: "defeat",
              teamId: teams[1]?.id || "2",
              teamName: teams[1]?.name || "Time Secundário",
              opponentName: "xXDragonSlayerXx",
              opponentTeamName: "Frost Team",
              score: "1-3",
              duration: "15:20",
              characters:
                teams[1]?.characters.map((char) => ({
                  id: char.id,
                  name: char.name,
                  imagePath: char.imagePath,
                })) || [],
              opponentCharacters: [
                { id: "op-4", name: "Zhezhi", imagePath: "/characters/zhe.webp" },
                { id: "op-5", name: "Sanhua", imagePath: "/characters/senhua.webp" },
                { id: "op-6", name: "Youhu", imagePath: "/characters/youhu.webp" },
              ],
            },
            {
              id: "match-3",
              date: "2025-05-07T20:45:00",
              result: "victory",
              teamId: teams[0]?.id || "1",
              teamName: teams[0]?.name || "Time Principal",
              opponentName: "ProGamer123",
              opponentTeamName: "Thunder Squad",
              score: "3-0",
              duration: "08:30",
              characters:
                teams[0]?.characters.map((char) => ({
                  id: char.id,
                  name: char.name,
                  imagePath: char.imagePath,
                })) || [],
              opponentCharacters: [
                { id: "op-7", name: "Yinlin", imagePath: "/characters/yinglin.webp" },
                { id: "op-8", name: "Calcharo", imagePath: "/characters/calcharo.webp" },
                { id: "op-9", name: "Lumi", imagePath: "/characters/lumi.webp" },
              ],
            },
            {
              id: "match-4",
              date: "2025-05-06T16:20:00",
              result: "victory",
              teamId: teams[2]?.id || "3",
              teamName: teams[2]?.name || "Time de Torneio",
              opponentName: "GamerKing",
              opponentTeamName: "Wind Walkers",
              score: "3-2",
              duration: "22:15",
              characters:
                teams[2]?.characters.map((char) => ({
                  id: char.id,
                  name: char.name,
                  imagePath: char.imagePath,
                })) || [],
              opponentCharacters: [
                { id: "op-10", name: "Jiyan", imagePath: "/characters/jiyan.webp" },
                { id: "op-11", name: "Jianxin", imagePath: "/characters/jianxin.webp" },
                { id: "op-12", name: "Aalto", imagePath: "/characters/aalto.webp" },
              ],
            },
            {
              id: "match-5",
              date: "2025-05-05T19:10:00",
              result: "defeat",
              teamId: teams[0]?.id || "1",
              teamName: teams[0]?.name || "Time Principal",
              opponentName: "MasterTactician",
              opponentTeamName: "Fusion Masters",
              score: "2-3",
              duration: "25:40",
              characters:
                teams[0]?.characters.map((char) => ({
                  id: char.id,
                  name: char.name,
                  imagePath: char.imagePath,
                })) || [],
              opponentCharacters: [
                { id: "op-13", name: "Changli", imagePath: "/characters/changli.webp" },
                { id: "op-14", name: "Brant", imagePath: "/characters/brant.webp" },
                { id: "op-15", name: "Chixia", imagePath: "/characters/chixia.webp" },
              ],
            },
          ]

          setMatchHistory(mockHistory)
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (teams.length > 0) {
      fetchMatchHistory()
    }
  }, [teams])

  const filteredHistory =
    activeTab === "all"
      ? matchHistory
      : activeTab === "victories"
        ? matchHistory.filter((match) => match.result === "victory")
        : matchHistory.filter((match) => match.result === "defeat")

  // Calcular estatísticas
  const totalMatches = matchHistory.length
  const victories = matchHistory.filter((match) => match.result === "victory").length
  const defeats = matchHistory.filter((match) => match.result === "defeat").length
  const winRate = totalMatches > 0 ? Math.round((victories / totalMatches) * 100) : 0

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (!isAuthenticated || isLoading || teamsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Histórico de Partidas</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Partidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vitórias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{victories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Derrotas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{defeats}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Vitória</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="victories">Vitórias</TabsTrigger>
              <TabsTrigger value="defeats">Derrotas</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredHistory.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nenhuma partida encontrada.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((match) => (
                  <Card
                    key={match.id}
                    className={`border-l-4 ${match.result === "victory" ? "border-l-green-500" : "border-l-red-500"}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-center gap-2">
                          {match.result === "victory" ? (
                            <Badge className="bg-green-500">Vitória</Badge>
                          ) : (
                            <Badge className="bg-red-500">Derrota</Badge>
                          )}
                          <div className="text-lg font-semibold">{match.score}</div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(match.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {match.duration}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Seu time */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4" />
                            <h3 className="font-semibold">Seu Time: {match.teamName}</h3>
                          </div>
                          <div className="flex gap-2">
                            {match.characters.map((character) => (
                              <div key={character.id} className="relative">
                                <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-800">
                                  {character.imagePath ? (
                                    <Image
                                      src={character.imagePath || "/placeholder.svg"}
                                      alt={character.name || "Personagem"}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                      {character.name ? character.name.charAt(0) : "?"}
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60 text-xs truncate">
                                    {character.name || "Desconhecido"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Time adversário */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-4 w-4" />
                            <h3 className="font-semibold">
                              Adversário: {match.opponentName} ({match.opponentTeamName})
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            {match.opponentCharacters.map((character) => (
                              <div key={character.id} className="relative">
                                <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-800">
                                  {character.imagePath ? (
                                    <Image
                                      src={character.imagePath || "/placeholder.svg"}
                                      alt={character.name || "Personagem"}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                      {character.name ? character.name.charAt(0) : "?"}
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60 text-xs truncate">
                                    {character.name || "Desconhecido"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Estatísticas de desempenho por time */}
        <h2 className="text-xl font-bold mt-8 mb-4">Desempenho por Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const teamMatches = matchHistory.filter((match) => match.teamId === team.id)
            const teamVictories = teamMatches.filter((match) => match.result === "victory").length
            const teamDefeats = teamMatches.filter((match) => match.result === "defeat").length
            const teamWinRate = teamMatches.length > 0 ? Math.round((teamVictories / teamMatches.length) * 100) : 0

            return (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    {team.characters.map((character, index) => (
                      <div key={index} className="w-12 h-12 rounded-md overflow-hidden bg-gray-800">
                        {character.imagePath ? (
                          <Image
                            src={character.imagePath || "/placeholder.svg"}
                            alt={character.name || "Personagem"}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            {character.name ? character.name.charAt(0) : "?"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Partidas</div>
                      <div className="text-xl font-semibold">{teamMatches.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Vitórias</div>
                      <div className="text-xl font-semibold flex items-center justify-center">
                        {teamVictories}
                        <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Derrotas</div>
                      <div className="text-xl font-semibold flex items-center justify-center">
                        {teamDefeats}
                        <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-1">Taxa de Vitória</div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${teamWinRate}%` }}></div>
                    </div>
                    <div className="text-right text-sm mt-1">{teamWinRate}%</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
