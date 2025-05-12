"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useTeams } from "@/hooks/use-teams"
import { useCharacters } from "@/hooks/use-characters"
import { useWeapons } from "@/hooks/use-weapons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Trash2, Edit, Save } from "lucide-react"

export default function TeamDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { teams, updateTeam, removeTeam } = useTeams();
  const { characters } = useCharacters();
  const { weapons } = useWeapons();
  
  const [team, setTeam] = useState(teams.find(t => t.id === params.id));
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCharacters, setEditCharacters] = useState<string[]>([]);
  
  useEffect(() => {
    const foundTeam = teams.find(t => t.id === params.id);
    if (!foundTeam) {
      router.push('/teams');
      return;
    }
    
    setTeam(foundTeam);
    setEditName(foundTeam.name);
    setEditCharacters(foundTeam.characters);
  }, [teams, params.id, router]);
  
  if (!team) {
    return null;
  }
  
  const teamCharacters = characters.filter(char => 
    team.characters.includes(char.id)
  );
  
  const handleDeleteTeam = () => {
    removeTeam(team.id);
    router.push('/teams');
    
    toast({
      title: "Deck excluído",
      description: "O deck foi removido com sucesso.",
      variant: "default"
    });
  };
  
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditName(team.name);
    setEditCharacters([...team.characters]);
  };
  
  const handleSaveEdit = () => {
    if (editName.trim() === '') {
      toast({
        title: "Nome do deck é obrigatório",
        description: "Por favor, forneça um nome para o deck.",
        variant: "destructive"
      });
      return;
    }
    
    if (editCharacters.length < 15) {
      toast({
        title: "Número mínimo de personagens não atingido",
        description: "Seu deck precisa ter pelo menos 15 personagens para torneios.",
        variant: "destructive"
      });
      return;
    }
    
    updateTeam({
      ...team,
      name: editName,
      characters: editCharacters
    });
    
    setIsEditing(false);
    
    toast({
      title: "Deck atualizado",
      description: "As alterações foram salvas com sucesso.",
      variant: "default"
    });
  };
  
  const handleSelectCharacter = (characterId: string) => {
    setEditCharacters(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/teams')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{team.name}</h1>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={handleStartEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir deck</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o deck "{team.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTeam}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
              {/* Implementação das Novas Funcionalidades para o Sistema de Torneio

              Vou implementar todas as modificações solicitadas, incluindo a exibição de armas vinculadas nos times, o sistema de decks com 15 personagens, e a sala de pick/ban com 6 escolhas por jogador e 3 pré-bans. */}
            </>
          )}
        </div>
      </div>
      
      {/* Display team characters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {teamCharacters.map(character => (
          <div 
            key={character.id}
            className="bg-card rounded-lg p-4 flex items-center gap-4 shadow-sm"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              {character.imagePath ? (
                <img src={character.imagePath} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-3xl font-bold text-muted-foreground">{character.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h3 className="font-medium">{character.name}</h3>
              <p className="text-sm text-muted-foreground">{character.element}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Edit mode */}
      {isEditing && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Editar Deck</h2>
          <div className="mb-4">
            <label htmlFor="teamName" className="block text-sm font-medium mb-1">Nome do Deck</label>
            <input
              id="teamName"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <h3 className="text-lg font-medium mb-2">Selecione os Personagens ({editCharacters.length} selecionados)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {characters.map(character => (
              <div 
                key={character.id}
                onClick={() => handleSelectCharacter(character.id)}
                className={`cursor-pointer p-3 rounded-md flex items-center gap-2 ${
                  editCharacters.includes(character.id) 
                    ? 'bg-primary/10 border border-primary' 
                    : 'bg-card hover:bg-card/80 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {character.imagePath ? (
                    <img src={character.imagePath} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold">{character.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-sm font-medium">{character.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
