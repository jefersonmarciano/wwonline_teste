"use client"

import { DraftInterface } from "@/components/draft/draft-interface"

export default function NewDraftPage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Novo Draft</h1>
      <div className="max-w-7xl mx-auto">
        <DraftInterface />
      </div>
    </div>
  )
}
