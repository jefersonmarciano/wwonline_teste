"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useWeapons } from "@/hooks/use-weapons"
import { useCharacters } from "@/hooks/use-characters"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function WeaponDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { weapons, isLoading: weaponsLoading, assignWeaponToCharacter } = useWeapons()
  const { characters, isLoading: charactersLoading } = useCharacters()
  const weapon = weapons.find((w) => w.id === params.id)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || weaponsLoading || charactersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!weapon) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Arma não encontrada</h2>
            <p className="text-muted-foreground mb-4">A arma que você está procurando não existe</p>
            <Button asChild>
              <Link href="/weapons">Ver todas as armas</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Encontrar o personagem que está usando esta arma
  const assignedCharacter = characters.find((char) => char.id === weapon.assignedTo)

  // Encontrar personagens compatíveis com esta arma
  const compatibleCharacters = characters.filter((char) => char.weapon === weapon.type)

  const handleUnassignWeapon = () => {
    assignWeaponToCharacter(weapon.id, null)
  }

  const handleAssignToCharacter = (characterId: string) => {
    assignWeaponToCharacter(weapon.id, characterId)
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
              <div className="aspect-square bg-gray-800 rounded-md flex items-center justify-center overflow-hidden p-4">
                <Image
                  src={weapon.imagePath || "/placeholder.svg"}
                  alt={weapon.name}
                  width={300}
                  height={300}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl">{weapon.name}</CardTitle>
                <Badge variant="outline" className="text-lg px-3">
                  {weapon.rarity}★
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tipo</h3>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {weapon.type}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <Badge
                    variant={weapon.assignedTo ? "default" : "outline"}
                    className={`text-base px-3 py-1 ${weapon.assignedTo ? "bg-green-600" : ""}`}
                  >
                    {weapon.assignedTo ? "Equipada" : "Disponível"}
                  </Badge>
                </div>

                {weapon.stats && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Ataque</h3>
                      <div className="font-medium">{weapon.stats.attack}</div>
                    </div>

                    {weapon.stats.critRate && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Taxa Crítica</h3>
                        <div className="font-medium">{weapon.stats.critRate}%</div>
                      </div>
                    )}

                    {weapon.stats.critDamage && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Dano Crítico</h3>
                        <div className="font-medium">{weapon.stats.critDamage}%</div>
                      </div>
                    )}

                    {weapon.stats.elementalDamage && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Dano Elemental</h3>
                        <div className="font-medium">{weapon.stats.elementalDamage}%</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {weapon.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                  <p className="text-sm">{weapon.description}</p>
                </div>
              )}

              {weapon.passive && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Habilidade Passiva</h3>
                  <p className="text-sm">{weapon.passive}</p>
                </div>
              )}

              {assignedCharacter && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Equipada por</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-800">
                      {assignedCharacter.imagePath ? (
                        <Image
                          src={assignedCharacter.imagePath || "/placeholder.svg"}
                          alt={assignedCharacter.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          {assignedCharacter.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{assignedCharacter.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignedCharacter.rarity}★ | {assignedCharacter.element}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-2" onClick={handleUnassignWeapon}>
                    Remover Equipamento
                  </Button>
                </div>
              )}

              {!assignedCharacter && (
                <div className="pt-4">
                  <Button asChild>
                    <Link href="/weapons/assign">Atribuir a um Personagem</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle>Personagens Compatíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {compatibleCharacters.map((character) => (
                  <Card key={character.id} className="overflow-hidden">
                    <div className="p-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-800">
                        {character.imagePath ? (
                          <Image
                            src={character.imagePath || "/placeholder.svg"}
                            alt={character.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            {character.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{character.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {character.rarity}★ | {character.element}
                        </div>
                      </div>
                      {character.id !== weapon.assignedTo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignToCharacter(character.id)}
                          className="ml-auto"
                        >
                          Equipar
                        </Button>
                      )}
                      {character.id === weapon.assignedTo && <Badge className="ml-auto bg-green-600">Equipada</Badge>}
                    </div>
                  </Card>
                ))}

                {compatibleCharacters.length === 0 && (
                  <div className="col-span-full text-center py-4">
                    <p className="text-muted-foreground">Nenhum personagem compatível encontrado.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
