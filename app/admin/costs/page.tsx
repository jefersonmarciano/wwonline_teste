"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCosts } from "@/hooks/use-costs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { AlertCircle, Save, RotateCcw, Filter } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CostsAdminPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const {
    characterCosts,
    weaponCosts,
    draftRules,
    updateCharacterCost,
    updateWeaponCost,
    updateDraftRules,
    resetToDefaults,
  } = useCosts()

  const [activeTab, setActiveTab] = useState("characters")
  const [elementFilter, setElementFilter] = useState<string | null>(null)
  const [weaponTypeFilter, setWeaponTypeFilter] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Verificar autenticação
  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  // Filtrar personagens por elemento
  const filteredCharacters = elementFilter
    ? characterCosts.filter((char) => char.element === elementFilter)
    : characterCosts

  // Filtrar armas por tipo
  const filteredWeapons = weaponTypeFilter
    ? weaponCosts.filter((weapon) => weapon.type === weaponTypeFilter)
    : weaponCosts

  // Elementos únicos para filtro
  const uniqueElements = Array.from(new Set(characterCosts.map((char) => char.element)))

  // Tipos de armas únicos para filtro
  const uniqueWeaponTypes = Array.from(new Set(weaponCosts.map((weapon) => weapon.type)))

  // Simular salvamento
  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
  }

  // Atualizar custo de personagem
  const handleUpdateCharacterCost = (characterId: string, level: string, value: number) => {
    const levelKey = level as keyof (typeof characterCosts)[0]["costs"]
    updateCharacterCost(characterId, { [levelKey]: value })
  }

  // Atualizar custo de arma
  const handleUpdateWeaponCost = (weaponId: string, level: string, value: number) => {
    const levelKey = level as keyof (typeof weaponCosts)[0]["costs"]
    updateWeaponCost(weaponId, { [levelKey]: value })
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gerenciamento de Custos</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "bg-primary/20" : ""}
            >
              {isEditing ? "Cancelar Edição" : "Editar Custos"}
            </Button>
            {isEditing && (
              <>
                <Button variant="destructive" onClick={resetToDefaults}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Resetar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </>
            )}
          </div>
        </div>

        {!isEditing && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Modo de Visualização</AlertTitle>
            <AlertDescription>
              Você está no modo de visualização. Clique em "Editar Custos" para fazer alterações.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="characters">Personagens</TabsTrigger>
            <TabsTrigger value="weapons">Armas</TabsTrigger>
            <TabsTrigger value="rules">Regras do Draft</TabsTrigger>
          </TabsList>

          <TabsContent value="characters">
            <Card>
              <CardHeader>
                <CardTitle>Custos dos Personagens</CardTitle>
                <CardDescription>Gerencie os custos dos personagens por nível de constelação (S0-S6)</CardDescription>
                <div className="flex items-center gap-2 mt-4">
                  <Filter className="h-4 w-4" />
                  <Label>Filtrar por Elemento:</Label>
                  <Select value={elementFilter || ""} onValueChange={(value) => setElementFilter(value || null)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {uniqueElements.map((element) => (
                        <SelectItem key={element} value={element}>
                          {element}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Elemento</TableHead>
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
                      {filteredCharacters.map((character) => (
                        <TableRow key={character.id}>
                          <TableCell className="font-medium">{character.name}</TableCell>
                          <TableCell>{character.element}</TableCell>
                          {Object.entries(character.costs).map(([level, cost]) => (
                            <TableCell key={level}>
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={cost}
                                  min={0}
                                  max={200}
                                  className="w-16"
                                  onChange={(e) =>
                                    handleUpdateCharacterCost(character.id, level, Number.parseInt(e.target.value) || 0)
                                  }
                                />
                              ) : (
                                cost
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weapons">
            <Card>
              <CardHeader>
                <CardTitle>Custos das Armas</CardTitle>
                <CardDescription>Gerencie os custos das armas por nível de refinamento (A1-A5)</CardDescription>
                <div className="flex items-center gap-2 mt-4">
                  <Filter className="h-4 w-4" />
                  <Label>Filtrar por Tipo:</Label>
                  <Select value={weaponTypeFilter || ""} onValueChange={(value) => setWeaponTypeFilter(value || null)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {uniqueWeaponTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>A1</TableHead>
                        <TableHead>A2</TableHead>
                        <TableHead>A3</TableHead>
                        <TableHead>A4</TableHead>
                        <TableHead>A5</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWeapons.map((weapon) => (
                        <TableRow key={weapon.id}>
                          <TableCell className="font-medium">{weapon.name}</TableCell>
                          <TableCell>{weapon.type}</TableCell>
                          {Object.entries(weapon.costs).map(([level, cost]) => (
                            <TableCell key={level}>
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={cost}
                                  min={0}
                                  max={10}
                                  className="w-16"
                                  onChange={(e) =>
                                    handleUpdateWeaponCost(weapon.id, level, Number.parseInt(e.target.value) || 0)
                                  }
                                />
                              ) : (
                                cost
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>Regras do Draft</CardTitle>
                <CardDescription>Configure as regras e limites para o sistema de draft</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="maxPoints">Pontos Máximos</Label>
                    <span>{draftRules.maxPoints}</span>
                  </div>
                  <Slider
                    id="maxPoints"
                    min={500}
                    max={3000}
                    step={100}
                    value={[draftRules.maxPoints]}
                    onValueChange={(value) => updateDraftRules({ maxPoints: value[0] })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="maxWeaponPoints">Pontos Máximos para Armas</Label>
                    <span>{draftRules.maxWeaponPoints}</span>
                  </div>
                  <Slider
                    id="maxWeaponPoints"
                    min={5}
                    max={50}
                    step={5}
                    value={[draftRules.maxWeaponPoints]}
                    onValueChange={(value) => updateDraftRules({ maxWeaponPoints: value[0] })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="minRosterSize">Tamanho Mínimo do Roster</Label>
                    <span>{draftRules.minRosterSize}</span>
                  </div>
                  <Slider
                    id="minRosterSize"
                    min={10}
                    max={30}
                    step={1}
                    value={[draftRules.minRosterSize]}
                    onValueChange={(value) => updateDraftRules({ minRosterSize: value[0] })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="minTotalCost">Custo Mínimo Total</Label>
                    <span>{draftRules.minTotalCost}</span>
                  </div>
                  <Slider
                    id="minTotalCost"
                    min={100}
                    max={500}
                    step={10}
                    value={[draftRules.minTotalCost]}
                    onValueChange={(value) => updateDraftRules({ minTotalCost: value[0] })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="maxCharacterDifference">Diferença Máxima entre Personagens</Label>
                    <span>{draftRules.maxCharacterDifference}</span>
                  </div>
                  <Slider
                    id="maxCharacterDifference"
                    min={10}
                    max={100}
                    step={5}
                    value={[draftRules.maxCharacterDifference]}
                    onValueChange={(value) => updateDraftRules({ maxCharacterDifference: value[0] })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="prebanPointDifference">Diferença de Pontos para Preban</Label>
                    <span>{draftRules.prebanPointDifference}</span>
                  </div>
                  <Slider
                    id="prebanPointDifference"
                    min={10}
                    max={100}
                    step={5}
                    value={[draftRules.prebanPointDifference]}
                    onValueChange={(value) => updateDraftRules({ prebanPointDifference: value[0] })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Estas configurações afetam diretamente o balanceamento do sistema de draft.
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
