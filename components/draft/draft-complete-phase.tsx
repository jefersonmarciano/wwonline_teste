"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Character } from "@/types/character"
import { Trophy, Share2 } from "lucide-react"
import Link from "next/link"

interface DraftCompletePhaseProps {
  team1Picks: (Character | null)[]
  team2Picks: (Character | null)[]
}

export default function DraftCompletePhase({ team1Picks, team2Picks }: DraftCompletePhaseProps) {
  return (
    <div className="flex-1 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Draft Concluído</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">Time 1 - odinzada</h3>
              <div className="grid grid-cols-2 gap-2">
                {team1Picks.filter(Boolean).map((character, index) => (
                  <div key={index} className="aspect-square bg-gray-700 rounded-md relative">
                    <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60 text-xs truncate">
                      {character?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-center">Time 2 - arthurobs2</h3>
              <div className="grid grid-cols-2 gap-2">
                {team2Picks.filter(Boolean).map((character, index) => (
                  <div key={index} className="aspect-square bg-gray-700 rounded-md relative">
                    <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60 text-xs truncate">
                      {character?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-muted-foreground">
            <p>O draft foi concluído com sucesso. Agora você pode iniciar a partida.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/dashboard">Voltar ao Dashboard</Link>
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar Resultado
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
