
"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { Plus, GitBranch, Share2, Info, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const nodeTypes = {
  familyMember: TreeNode,
};

export default function FamilyTreePage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<Person>>({ name: "", birthDate: "" });

  const householdId = user?.uid || "default";

  const personsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "persons");
  }, [firestore, user, householdId]);

  const relationshipsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "relationships");
  }, [firestore, user, householdId]);

  const { data: persons, isLoading: isPersonsLoading } = useCollection(personsQuery);
  const { data: relationships, isLoading: isRelLoading } = useCollection(relationshipsQuery);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (persons) {
      const newNodes: Node[] = persons.map((person: any, index: number) => {
        return {
          id: person.id,
          type: "familyMember",
          position: { x: index * 200, y: index * 100 }, // Simple initial positioning
          data: { person },
        };
      });
      setNodes(newNodes);
    }
  }, [persons, setNodes]);

  useEffect(() => {
    if (relationships) {
      const newEdges: Edge[] = relationships.map((rel: any) => {
        return {
          id: rel.id,
          source: rel.person1Id,
          target: rel.person2Id,
          animated: rel.type === "parent-child",
          label: rel.type,
          style: { stroke: rel.type === "spouse" ? 'hsl(var(--accent))' : 'hsl(var(--primary))', strokeWidth: 2 },
        };
      });
      setEdges(newEdges);
    }
  }, [relationships, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!user) return;
      const relRef = collection(firestore, "households", householdId, "relationships");
      addDocumentNonBlocking(relRef, {
        householdId,
        person1Id: params.source,
        person2Id: params.target,
        type: "parent-child",
        createdAt: serverTimestamp(),
        createdByUserId: user.uid,
        householdMembers: { [user.uid]: "admin" }
      });
    },
    [firestore, householdId, user]
  );

  const handleAdd = () => {
    if (!newPerson.name || !user) return;

    const personData = {
      householdId,
      name: newPerson.name,
      birthDate: newPerson.birthDate || "",
      photoUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
      createdAt: serverTimestamp(),
      createdByUserId: user.uid,
      householdMembers: { [user.uid]: "admin" }
    };

    const personsRef = collection(firestore, "households", householdId, "persons");
    addDocumentNonBlocking(personsRef, personData);
    setIsAddOpen(false);
    setNewPerson({ name: "", birthDate: "" });
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
        {isPersonsLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
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
        )}
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
            <Button onClick={handleAdd}>{t("common.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
