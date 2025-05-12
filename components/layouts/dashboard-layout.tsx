"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { LayoutDashboard, Users, Trophy, History, Settings, LogOut, Menu, X, Swords, Database } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teams", label: "Times", icon: Users },
    { href: "/collection", label: "Coleção", icon: Database },
    { href: "/weapons", label: "Armas", icon: Swords },
    { href: "/tournaments", label: "Torneios", icon: Trophy },
    { href: "/history", label: "Histórico", icon: History },
    { href: "/settings", label: "Configurações", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-full">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Wuthering Waves</h1>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                logout()
                setSidebarOpen(false)
              }}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
