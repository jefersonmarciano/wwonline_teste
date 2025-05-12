"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { useWeapons } from "@/hooks/use-weapons"
import { PlusCircle } from "lucide-react"
import WeaponCard from "@/components/weapons/weapon-card"
import Link from "next/link"

export default function WeaponsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { weapons, isLoading } = useWeapons()
  const [activeTab, setActiveTab] = useState("all")

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

  // Agrupar armas por tipo
  const weaponsByType = {
    all: weapons,
    Espada: weapons.filter((weapon) => weapon.type === "Espada"),
    "Lâmina larga": weapons.filter((weapon) => weapon.type === "Lâmina larga"),
    Manopla: weapons.filter((weapon) => weapon.type === "Manopla"),
    Retificador: weapons.filter((weapon) => weapon.type === "Retificador"),
    Pistola: weapons.filter((weapon) => weapon.type === "Pistola"),
  }

  // Contar armas por raridade
  const fiveStarWeapons = weapons.filter((weapon) => weapon.rarity === 5).length
  const fourStarWeapons = weapons.filter((weapon) => weapon.rarity === 4).length
  const assignedWeapons = weapons.filter((weapon) => weapon.assignedTo).length

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Armas</h1>

          <div className="flex gap-2">
            <Button asChild>
              <Link href="/weapons/assign">
                <PlusCircle className="h-4 w-4 mr-2" />
                Atribuir Armas
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Armas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weapons.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Armas 5★</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fiveStarWeapons}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Armas Atribuídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignedWeapons}/{weapons.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="Espada">Espada</TabsTrigger>
              <TabsTrigger value="Lâmina larga">Lâmina larga</TabsTrigger>
              <TabsTrigger value="Manopla">Manopla</TabsTrigger>
              <TabsTrigger value="Retificador">Retificador</TabsTrigger>
              <TabsTrigger value="Pistola">Pistola</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {weaponsByType[activeTab as keyof typeof weaponsByType].map((weapon) => (
                <Link key={weapon.id} href={`/weapons/${weapon.id}`}>
                  <WeaponCard weapon={weapon} isAssigned={!!weapon.assignedTo} />
                </Link>
              ))}

              {weaponsByType[activeTab as keyof typeof weaponsByType].length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Nenhuma arma encontrada nesta categoria.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
