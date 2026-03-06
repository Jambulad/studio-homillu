
"use client"

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Heart, Users, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { generateFamilyTreeDescription } from "@/ai/flows/generate-family-tree-description";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Handle, Position } from "@xyflow/react";

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
  data: {
    person: Person;
    onEdit?: (person: Person) => void;
    onAddRelation?: (person: Person) => void;
  };
}

export function TreeNode({ data }: TreeNodeProps) {
  const { person, onEdit, onAddRelation } = data;
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiDescription = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="relative group">
      {/* Connector Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-2 border-background" />
      
      <Card className="p-3 flex flex-col items-center gap-2 w-44 shadow-lg hover:shadow-2xl transition-all border-primary/20 bg-card/90 backdrop-blur-md z-10 relative">
        <Avatar className="h-20 w-20 ring-4 ring-primary ring-offset-4 transition-transform group-hover:scale-105">
          <AvatarImage src={person.photoUrl} alt={person.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center overflow-hidden">
          <h3 className="font-bold text-base leading-tight truncate w-full">{person.name}</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
            {person.role || "Family Member"}
          </p>
        </div>

        <div className="flex justify-center gap-1 mt-2">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary hover:bg-primary/10" 
              onClick={(e) => { e.stopPropagation(); onEdit(person); }}
              title={t("common.edit")}
            >
              <Users className="h-4 w-4" />
            </Button>
          )}
          {onAddRelation && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-accent hover:bg-accent/10" 
              onClick={(e) => { e.stopPropagation(); onAddRelation(person); }}
              title={t("tree.relationship")}
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleAiDescription}
            disabled={isGenerating}
            title={t("tree.generateDescription")}
          >
            {isGenerating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Sparkles className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>
      </Card>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-2 border-background" />
    </div>
  );
}
