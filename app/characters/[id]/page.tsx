"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useCharacters } from "@/hooks/use-characters"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { ArrowLeft, Wind, Sun, Snowflake, Target, Flame, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CharacterDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { characters, isLoading } = useCharacters()
  const character = characters.find((c) => c.id === params.id)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!character) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Personagem não encontrado</h2>
            <p className="text-muted-foreground mb-4">O personagem que você está procurando não existe</p>
            <Button asChild>
              <Link href="/characters">Ver todos os personagens</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const elementIcons = {
    Aero: <Wind className="h-5 w-5 text-teal-400" />,
    Espectro: <Sun className="h-5 w-5 text-yellow-400" />,
    Glacio: <Snowflake className="h-5 w-5 text-blue-400" />,
    Devastação: <Target className="h-5 w-5 text-pink-400" />,
    Fusão: <Flame className="h-5 w-5 text-orange-400" />,
    Eletro: <Zap className="h-5 w-5 text-purple-400" />,
  }

  const elementIcon = elementIcons[character.element as keyof typeof elementIcons]
  const elementColors = {
    Aero: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    Espectro: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Glacio: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Devastação: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    Fusão: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    Eletro: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  }

  const tierColors = {
    SS: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    S: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    UM: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    B: "bg-green-500/10 text-green-500 border-green-500/20",
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Imagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                {character.imagePath ? (
                  <Image
                    src={character.imagePath || "/placeholder.svg"}
                    alt={character.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-6xl font-bold text-gray-700">{character.name.charAt(0)}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">{character.name}</CardTitle>
                <Badge variant="outline" className="text-lg px-3">
                  {character.rarity}★
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Elemento</h3>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 text-base px-3 py-1 ${
                      elementColors[character.element as keyof typeof elementColors]
                    }`}
                  >
                    {elementIcon}
                    {character.element}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tier</h3>
                  <Badge
                    variant="outline"
                    className={`text-base px-3 py-1 ${tierColors[character.tier as keyof typeof tierColors]}`}
                  >
                    {character.tier}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Arma</h3>
                  <div className="font-medium">{character.weapon}</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ID</h3>
                  <div className="font-medium">{character.id}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                <p className="text-sm">
                  {character.description ||
                    "Este personagem ainda não possui uma descrição detalhada. As informações serão atualizadas em breve."}
                </p>
              </div>

              <div className="pt-4 flex gap-2">
                <Button>Adicionar ao Time</Button>
                <Button variant="outline">Ver Builds</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-md p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Ataque</div>
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 1000 + 500)} + {Math.floor(Math.random() * 200)}
                  </div>
                </div>

                <div className="bg-card border rounded-md p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Defesa</div>
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 500 + 300)} + {Math.floor(Math.random() * 100)}
                  </div>
                </div>

                <div className="bg-card border rounded-md p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">HP</div>
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 5000 + 3000)} + {Math.floor(Math.random() * 1000)}
                  </div>
                </div>

                <div className="bg-card border rounded-md p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Velocidade</div>
                  <div className="text-2xl font-bold">{Math.floor(Math.random() * 50 + 100)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
