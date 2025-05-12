"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Character } from "@/types/character"
import Link from "next/link"
import Image from "next/image"

interface CharacterCardProps {
  character: Character
  elementIcons: Record<string, React.ReactNode>
}

export default function CharacterCard({ character, elementIcons }: CharacterCardProps) {
  const elementIcon = elementIcons[character.element as keyof typeof elementIcons]

  return (
    <Link href={`/characters/${character.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <div className="aspect-square bg-gray-800 relative">
          {character.imagePath ? (
            <Image
              src={character.imagePath || "/placeholder.svg"}
              alt={character.name}
              width={300}
              height={300}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-700">
              {character.name.charAt(0)}
            </div>
          )}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
              {elementIcon}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
              {character.rarity}★
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
            <div className="text-lg font-semibold truncate text-white">{character.name}</div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-300">{character.tier}</div>
              <div className="text-sm text-gray-300">{character.weapon}</div>
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Elemento</div>
            <div className="flex items-center gap-1">
              {elementIcon}
              <span>{character.element}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
