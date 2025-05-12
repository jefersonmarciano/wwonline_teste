import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Wuthering Waves</h1>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Registrar</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Sistema de Pick & Ban para Wuthering Waves</h2>
          <p className="text-xl text-gray-300 mb-8">
            Crie times, desafie outros jogadores e participe de torneios com nosso sistema de pick e ban.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">Crie sua conta</h3>
              <p className="text-gray-400 mb-4">
                Cadastre-se para criar times com seus personagens favoritos e participar de torneios.
              </p>
              <Button className="w-full" asChild>
                <Link href="/register">Começar</Link>
              </Button>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">Crie uma sala</h3>
              <p className="text-gray-400 mb-4">Convide outros jogadores para uma partida com sistema de pick e ban.</p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Aero", "Espectro", "Glacio", "Devastação", "Fusão", "Eletro"].map((elemento) => (
              <div key={elemento} className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                <div className="text-sm font-medium text-gray-400 mb-1">Elemento</div>
                <div className="text-lg font-semibold text-white">{elemento}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="container mx-auto py-6 text-center text-gray-500">
        <p>© 2025 Wuthering Waves Pick & Ban System</p>
      </footer>
    </div>
  )
}
