"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Volume2, Bell, MessageSquare, Moon, Sun, Languages, Save } from "lucide-react"

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [soundVolume, setSoundVolume] = useState(80)
  const [musicVolume, setMusicVolume] = useState(60)
  const [notifications, setNotifications] = useState(true)
  const [chatEnabled, setChatEnabled] = useState(true)
  const [language, setLanguage] = useState("pt-BR")
  const [theme, setTheme] = useState("dark")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    // Simulando salvamento de configurações
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Áudio</CardTitle>
              <CardDescription>Configurações de som e música</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-volume" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Volume de Efeitos Sonoros
                  </Label>
                  <span className="text-sm text-muted-foreground">{soundVolume}%</span>
                </div>
                <Slider
                  id="sound-volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[soundVolume]}
                  onValueChange={(values) => setSoundVolume(values[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-volume" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Volume da Música
                  </Label>
                  <span className="text-sm text-muted-foreground">{musicVolume}%</span>
                </div>
                <Slider
                  id="music-volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[musicVolume]}
                  onValueChange={(values) => setMusicVolume(values[0])}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Configurações de tema e interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme" className="flex items-center gap-2">
                  {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Tema
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Idioma
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configurações de notificações e alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações do Sistema
                </Label>
                <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat durante Draft
                </Label>
                <Switch id="chat" checked={chatEnabled} onCheckedChange={setChatEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>Informações da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input id="username" value={user?.name || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} readOnly />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
