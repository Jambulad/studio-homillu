
"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TreeNode, Person } from "@/components/features/family-tree/tree-node";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialFamily: Person[] = [
  { id: "1", name: "Ramesh Rao", birthDate: "15-05-1955", photoUrl: "https://picsum.photos/seed/1/200/200", role: "Grandfather" },
  { id: "2", name: "Sita Lakshmi", birthDate: "12-10-1960", photoUrl: "https://picsum.photos/seed/2/200/200", role: "Grandmother" },
  { id: "3", name: "Srinivas Rao", birthDate: "20-08-1985", photoUrl: "https://picsum.photos/seed/3/200/200", role: "Father" },
  { id: "4", name: "Anjali Rao", birthDate: "05-12-1988", photoUrl: "https://picsum.photos/seed/4/200/200", role: "Mother" },
  { id: "5", name: "Aryan Rao", birthDate: "10-01-2015", photoUrl: "https://picsum.photos/seed/5/200/200", role: "Son" },
];

export default function FamilyTreePage() {
  const { t } = useTranslation();
  const [family, setFamily] = useState<Person[]>(initialFamily);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<Person>>({ name: "", birthDate: "" });

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div className="bg-secondary/30 rounded-2xl p-8 min-h-[600px] border-2 border-dashed border-muted flex flex-col items-center justify-start overflow-auto">
        {/* Simple Tree Visualization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-center justify-center">
          {family.map((person) => (
            <div key={person.id} className="relative">
              <TreeNode 
                person={person} 
                onEdit={() => {}} 
                onAddRelation={() => {}} 
              />
              {/* Visual Connector Lines Simulation */}
              <div className="hidden lg:block absolute -right-6 top-1/2 w-6 h-0.5 bg-primary/20" />
            </div>
          ))}
        </div>
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
