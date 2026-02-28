"use client"

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Heart, Baby, Users, Sparkles } from "lucide-react";
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
  parentId?: string;
  spouseId?: string;
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
    <Card className="p-3 flex flex-col items-center gap-2 w-40 shadow-md hover:shadow-xl transition-all border-primary/20 bg-card/80 backdrop-blur-sm z-10 relative group">
      <Avatar className="h-16 w-16 ring-2 ring-primary ring-offset-2 transition-transform group-hover:scale-105">
        <AvatarImage src={person.photoUrl} alt={person.name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          <User className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>
      
      <div className="text-center overflow-hidden">
        <h3 className="font-bold text-sm leading-tight truncate w-full">{person.name}</h3>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          {person.role || "Member"}
        </p>
      </div>

      <div className="flex justify-center gap-1 mt-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-primary hover:bg-primary/10" 
          onClick={() => onEdit(person)}
          title={t("common.edit")}
        >
          <Users className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-accent hover:bg-accent/10" 
          onClick={() => onAddRelation(person)}
          title={t("tree.relationship")}
        >
          <Heart className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-7 w-7" 
          onClick={handleAiDescription}
          disabled={isGenerating}
          title={t("tree.generateDescription")}
        >
          {isGenerating ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          )}
        </Button>
      </div>
    </Card>
  );
}
