"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useCosts } from "@/hooks/use-costs"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { FileText, Shield, Swords, Award } from "lucide-react"
import { useEffect } from "react"

export default function DraftRulesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { characterCosts, weaponCosts, draftRules } = useCosts()

  // Usamos useEffect para realizar o redirecionamento no cliente
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div className="p-6">Carregando...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  // Agrupar personagens por elemento
  const charactersByElement: Record<string, typeof characterCosts> = {}
  characterCosts.forEach((char) => {
    if (!charactersByElement[char.element]) {
      charactersByElement[char.element] = []
    }
    charactersByElement[char.element].push(char)
  })

  // Agrupar armas por tipo
  const weaponsByType: Record<string, typeof weaponCosts> = {}
  weaponCosts.forEach((weapon) => {
    if (!weaponsByType[weapon.type]) {
      weaponsByType[weapon.type] = []
    }
    weaponsByType[weapon.type].push(weapon)
  })

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Regras do Draft</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                Regras Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  Pontos máximos: <span className="font-bold">{draftRules.maxPoints}</span>
                </li>
                <li>
                  Pontos máximos para armas: <span className="font-bold">{draftRules.maxWeaponPoints}</span>
                </li>
                <li>
                  Tamanho mínimo do roster: <span className="font-bold">{draftRules.minRosterSize}</span>
                </li>
                <li>
                  Custo mínimo total: <span className="font-bold">{draftRules.minTotalCost}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Swords className="h-5 w-5 mr-2 text-red-500" />
                Regras de Ban
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  Diferença máxima entre personagens:{" "}
                  <span className="font-bold">{draftRules.maxCharacterDifference}</span>
                </li>
                <li>
                  Diferença de pontos para preban: <span className="font-bold">{draftRules.prebanPointDifference}</span>
                </li>
                <li>
                  Opções de custo: <span className="font-bold">{draftRules.costOptions.join(" / ")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Multiplicadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  Pontos por constelação: <span className="font-bold">{draftRules.pointsPerConstellation}</span>
                </li>
                <li>
                  Pontos por refinamento: <span className="font-bold">{draftRules.pointsPerRefinement}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="characters">
          <TabsList className="mb-6">
            <TabsTrigger value="characters">Custos de Personagens</TabsTrigger>
            <TabsTrigger value="weapons">Custos de Armas</TabsTrigger>
          </TabsList>

          <TabsContent value="characters">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Tabela de Custos de Personagens
                </CardTitle>
                <CardDescription>Custos dos personagens por nível de constelação (S0-S6)</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(charactersByElement).map(([element, chars]) => (
                  <div key={element} className="mb-8">
                    <h3 className="text-lg font-bold mb-3">{element}</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>S0</TableHead>
                            <TableHead>S1</TableHead>
                            <TableHead>S2</TableHead>
                            <TableHead>S3</TableHead>
                            <TableHead>S4</TableHead>
                            <TableHead>S5</TableHead>
                            <TableHead>S6</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chars.map((character) => (
                            <TableRow key={character.id}>
                              <TableCell className="font-medium">{character.name}</TableCell>
                              <TableCell>{character.costs.S0}</TableCell>
                              <TableCell>{character.costs.S1}</TableCell>
                              <TableCell>{character.costs.S2}</TableCell>
                              <TableCell>{character.costs.S3}</TableCell>
                              <TableCell>{character.costs.S4}</TableCell>
                              <TableCell>{character.costs.S5}</TableCell>
                              <TableCell>{character.costs.S6}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">S0 = Sem constelação, S1-S6 = Níveis de constelação</div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="weapons">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Tabela de Custos de Armas
                </CardTitle>
                <CardDescription>Custos das armas por nível de refinamento (A1-A5)</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(weaponsByType).map(([type, weapons]) => (
                  <div key={type} className="mb-8">
                    <h3 className="text-lg font-bold mb-3">{type}</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>A1</TableHead>
                            <TableHead>A2</TableHead>
                            <TableHead>A3</TableHead>
                            <TableHead>A4</TableHead>
                            <TableHead>A5</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {weapons.map((weapon) => (
                            <TableRow key={weapon.id}>
                              <TableCell className="font-medium">{weapon.name}</TableCell>
                              <TableCell>{weapon.costs.A1}</TableCell>
                              <TableCell>{weapon.costs.A2}</TableCell>
                              <TableCell>{weapon.costs.A3}</TableCell>
                              <TableCell>{weapon.costs.A4}</TableCell>
                              <TableCell>{weapon.costs.A5}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">A1-A5 = Níveis de refinamento da arma</div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => router.push("/admin/costs")}>
            Ir para Gerenciamento de Custos
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
