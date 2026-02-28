
"use client"

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Heart, Baby, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { generateFamilyTreeDescription } from "@/ai/flows/generate-family-tree-description";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Person {
  id: string;
  name: string;
  photoUrl?: string;
  birthDate: string;
  deathDate?: string;
  role?: string;
}

interface TreeNodeProps {
  person: Person;
  onEdit: (person: Person) => void;
  onAddRelation: (person: Person) => void;
}

export function TreeNode({ person, onEdit, onAddRelation }: TreeNodeProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiDescription = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFamilyTreeDescription({
        type: "person",
        personName: person.name,
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        additionalDetails: `Role: ${person.role || 'Family Member'}`
      });
      
      toast({
        title: person.name,
        description: result.description,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate profile summary.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4 flex flex-col items-center gap-3 w-48 shadow-lg hover:shadow-xl transition-shadow border-primary/20 bg-card">
      <Avatar className="h-20 w-20 ring-2 ring-primary ring-offset-2">
        <AvatarImage src={person.photoUrl} alt={person.name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          <User className="h-10 w-10" />
        </AvatarFallback>
      </Avatar>
      
      <div className="text-center">
        <h3 className="font-bold text-lg leading-tight truncate w-full px-1">{person.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {person.birthDate} {person.deathDate ? `- ${person.deathDate}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mt-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => onEdit(person)}>
          <Users className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:bg-accent/10" onClick={() => onAddRelation(person)}>
          <Heart className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          className="text-[10px] h-7 px-2 mt-1" 
          onClick={handleAiDescription}
          disabled={isGenerating}
        >
          {isGenerating ? t("common.loading") : t("tree.generateDescription")}
        </Button>
      </div>
    </Card>
  );
}
