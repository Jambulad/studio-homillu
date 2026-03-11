
"use client"

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Users, Sparkles, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { generateFamilyTreeDescription } from "@/ai/flows/generate-family-tree-description";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Handle, Position } from "@xyflow/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Person {
  id: string;
  name: string;
  photoUrl?: string;
  birthDate: string;
  deathDate?: string;
  role?: string;
  gender?: string;
  description?: string;
  parentId?: string;
  spouseId?: string;
}

interface TreeNodeProps {
  data: {
    person: Person;
    onEdit?: (person: Person) => void;
    onDelete?: (personId: string) => void;
  };
}

export function TreeNode({ data }: TreeNodeProps) {
  const { person, onEdit, onDelete } = data;
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
        additionalDetails: `Role: ${person.role || 'Family Member'}. Gender: ${person.gender}`
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

  const GenderIcon = person.gender === 'female' ? (
    <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full p-1 shadow-md border-2 border-white">
      <Users className="h-3 w-3" />
    </div>
  ) : (
    <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1 shadow-md border-2 border-white">
      <User className="h-3 w-3" />
    </div>
  );

  return (
    <TooltipProvider>
      <div className="relative group">
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-2 border-background" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="p-3 flex flex-col items-center gap-2 w-44 shadow-lg hover:shadow-2xl transition-all border-primary/20 bg-card/90 backdrop-blur-md z-10 relative cursor-help">
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-7 w-7 bg-background/80" 
                  onClick={(e) => { e.stopPropagation(); onEdit?.(person); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(person.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="relative mt-2">
                <Avatar className="h-20 w-20 ring-4 ring-primary ring-offset-4 transition-transform group-hover:scale-105">
                  <AvatarImage src={person.photoUrl} alt={person.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                {GenderIcon}
              </div>
              
              <div className="text-center overflow-hidden w-full">
                <h3 className="font-bold text-base leading-tight truncate px-1">{person.name}</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                  {person.role || "Member"}
                </p>
                {person.birthDate && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {person.birthDate}
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-1 mt-2">
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
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px] p-4 bg-popover/95 backdrop-blur shadow-xl border-primary/20">
            <div className="space-y-2">
              <p className="font-bold text-sm text-primary flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" />
                About {person.name.split(' ')[0]}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {person.description || "No description provided yet."}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-2 border-background" />
      </div>
    </TooltipProvider>
  );
}
