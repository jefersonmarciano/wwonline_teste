'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Componente que usa hooks do cliente
function NotFoundContent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando pode ter sido removida, renomeada ou está temporariamente indisponível.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Voltar para o início</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Ir para Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Página principal com Suspense
export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  )
} 