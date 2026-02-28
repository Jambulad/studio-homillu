
"use client"

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TreeNode, Person } from "@/components/features/family-tree/tree-node";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch, Share2, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialFamily: Person[] = [
  { id: "1", name: "Ramesh Rao", birthDate: "15-05-1955", photoUrl: "https://picsum.photos/seed/1/200/200", role: "Grandfather" },
  { id: "2", name: "Sita Lakshmi", birthDate: "12-10-1960", photoUrl: "https://picsum.photos/seed/2/200/200", role: "Grandmother", spouseId: "1" },
  { id: "3", name: "Srinivas Rao", birthDate: "20-08-1985", photoUrl: "https://picsum.photos/seed/3/200/200", role: "Father", parentId: "1" },
  { id: "4", name: "Anjali Rao", birthDate: "05-12-1988", photoUrl: "https://picsum.photos/seed/4/200/200", role: "Mother", spouseId: "3" },
  { id: "5", name: "Aryan Rao", birthDate: "10-01-2015", photoUrl: "https://picsum.photos/seed/5/200/200", role: "Son", parentId: "3" },
];

export default function FamilyTreePage() {
  const { t } = useTranslation();
  const [family, setFamily] = useState<Person[]>(initialFamily);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<Person>>({ name: "", birthDate: "" });
  const [zoom, setZoom] = useState(1);

  const handleAdd = () => {
    if (newPerson.name && newPerson.birthDate) {
      const person: Person = {
        id: Date.now().toString(),
        name: newPerson.name,
        birthDate: newPerson.birthDate,
        photoUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
      };
      setFamily([...family, person]);
      setIsAddOpen(false);
      setNewPerson({ name: "", birthDate: "" });
    }
  };

  // Group members into generations for visualization
  const generations = useMemo(() => [
    { label: "Grandparents", members: family.filter(p => p.role?.includes("Grand")) },
    { label: "Parents", members: family.filter(p => p.role === "Father" || p.role === "Mother") },
    { label: "Children", members: family.filter(p => p.role === "Son" || p.role === "Daughter" || (!p.role?.includes("Grand") && p.parentId && !p.role?.includes("Mother") && !p.role?.includes("Father"))) }
  ], [family]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <GitBranch className="h-8 w-8" />
            {t("tree.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            Build and visualize your family legacy.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-secondary rounded-lg px-2 mr-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="gap-2 shadow-lg" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("tree.addPerson")}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-secondary/20 rounded-2xl border-2 border-dashed border-muted overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div 
            className="p-12 min-w-[1000px] flex flex-col items-center transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoom})` }}
          >
            {generations.map((gen, gIdx) => (
              <div key={gen.label} className="flex flex-col items-center w-full relative">
                <div className="flex gap-20 justify-center mb-24 relative">
                  {gen.members.map((person) => (
                    <div key={person.id} className="relative">
                      <TreeNode 
                        person={person} 
                        onEdit={() => {}} 
                        onAddRelation={() => {}} 
                      />
                      
                      {/* Spouse Connector */}
                      {person.spouseId && (
                        <div className="absolute top-1/2 -right-10 w-10 h-0.5 bg-primary/40 z-0" />
                      )}

                      {/* Visual Branch Connectors */}
                      {gIdx < generations.length - 1 && (person.role === "Father" || person.role === "Grandfather") && (
                        <svg className="absolute top-full left-1/2 -translate-x-1/2 w-[200px] h-24 overflow-visible pointer-events-none">
                          <path 
                            d="M 100 0 L 100 40" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth="2" 
                            fill="none" 
                            className="opacity-40"
                          />
                          {/* If Grandfather, connect to children row */}
                          {person.role === "Grandfather" && (
                            <path 
                              d="M 100 40 L 100 80" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth="2" 
                              fill="none" 
                              className="opacity-40"
                            />
                          )}
                          {/* If Father, spread to kids */}
                          {person.role === "Father" && (
                            <>
                              <path 
                                d="M 100 40 L 100 80" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth="2" 
                                fill="none" 
                                className="opacity-40"
                              />
                              <circle cx="100" cy="40" r="3" fill="hsl(var(--primary))" className="opacity-60" />
                            </>
                          )}
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("tree.addPerson")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={newPerson.name} 
                onChange={(e) => setNewPerson({...newPerson, name: e.target.value})} 
                placeholder="Full Name" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birth">Birth Date</Label>
              <Input 
                id="birth" 
                value={newPerson.birthDate} 
                onChange={(e) => setNewPerson({...newPerson, birthDate: e.target.value})} 
                placeholder="DD-MM-YYYY" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleAdd}>{t("common.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
