
"use client"

import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  Panel
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TreeNode, Person } from "@/components/features/family-tree/tree-node";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch, Share2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialFamily: Person[] = [
  { id: "1", name: "Jambula Chandraiah", birthDate: "01-01-1940", photoUrl: "https://picsum.photos/seed/grandfather/200/200", role: "Grandfather" },
  { id: "2", name: "Jambula Laxmamma", birthDate: "01-01-1945", photoUrl: "https://picsum.photos/seed/grandmother/200/200", role: "Grandmother", spouseId: "1" },
  { id: "3", name: "Jambula Sreerama Murthy", birthDate: "15-06-1970", photoUrl: "https://picsum.photos/seed/son/200/200", role: "Son", parentId: "1" },
  { id: "4", name: "Jambula Latha", birthDate: "20-11-1975", photoUrl: "https://picsum.photos/seed/daughter/200/200", role: "Daughter", parentId: "1" },
];

const nodeTypes = {
  familyMember: TreeNode,
};

export default function FamilyTreePage() {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<Person>>({ name: "", birthDate: "" });

  // Convert family data to Flow nodes and edges
  const initialNodes: Node[] = initialFamily.map((person, index) => {
    // Basic auto-layout based on role/parentage
    let x = 0;
    let y = 0;

    if (person.role === "Grandfather") {
      y = 0;
      x = -150;
    } else if (person.role === "Grandmother") {
      y = 0;
      x = 150;
    } else if (person.role === "Son") {
      y = 250;
      x = -150;
    } else if (person.role === "Daughter") {
      y = 250;
      x = 150;
    } else {
      y = 500;
      x = index * 100;
    }

    return {
      id: person.id,
      type: "familyMember",
      position: { x, y },
      data: { person },
    };
  });

  const initialEdges: Edge[] = [];
  initialFamily.forEach((person) => {
    if (person.parentId) {
      initialEdges.push({
        id: `e${person.parentId}-${person.id}`,
        source: person.parentId,
        target: person.id,
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      });
    }
    if (person.spouseId) {
      initialEdges.push({
        id: `e${person.id}-${person.spouseId}`,
        source: person.id,
        target: person.spouseId,
        type: 'smoothstep',
        label: 'Spouse',
        style: { stroke: 'hsl(var(--accent))', strokeWidth: 2, strokeDasharray: '5,5' },
      });
    }
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAdd = () => {
    if (newPerson.name && newPerson.birthDate) {
      const id = Date.now().toString();
      const person: Person = {
        id,
        name: newPerson.name,
        birthDate: newPerson.birthDate,
        photoUrl: `https://picsum.photos/seed/${id}/200/200`,
      };
      
      const newNode: Node = {
        id,
        type: "familyMember",
        position: { x: Math.random() * 400 - 200, y: Math.random() * 400 },
        data: { person },
      };

      setNodes((nds) => nds.concat(newNode));
      setIsAddOpen(false);
      setNewPerson({ name: "", birthDate: "" });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <GitBranch className="h-8 w-8" />
            {t("tree.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("tree.description")}
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

      <div className="flex-1 bg-secondary/10 rounded-2xl border-2 border-dashed border-muted overflow-hidden relative shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-dot-pattern"
        >
          <Background color="hsl(var(--muted-foreground))" gap={20} size={1} opacity={0.1} />
          <Controls className="fill-primary" />
          <MiniMap 
            nodeColor={(node) => 'hsl(var(--primary))'}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="border-primary/20 bg-background/50 rounded-lg shadow-lg"
          />
          <Panel position="bottom-center" className="bg-background/80 backdrop-blur-md p-4 rounded-xl border shadow-xl flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-primary" />
              <span className="text-xs font-bold text-muted-foreground">Bloodline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-accent border-dashed border-t" />
              <span className="text-xs font-bold text-muted-foreground">Marriage</span>
            </div>
            <div className="flex items-center gap-2 ml-4 text-xs text-muted-foreground italic">
              <Info className="h-3 w-3" />
              Drag nodes to reorganize
            </div>
          </Panel>
        </ReactFlow>
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
