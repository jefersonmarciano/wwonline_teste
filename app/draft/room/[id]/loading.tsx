import { Loader } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Carregando sala de draft...</p>
      </div>
    </div>
  )
}
