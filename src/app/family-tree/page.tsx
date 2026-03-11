
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
import { Plus, GitBranch, Share2, Info, Loader2, Camera, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, addDoc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

const nodeTypes = {
  familyMember: TreeNode,
};

export default function FamilyTreePage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const initialPersonState: Partial<Person & { relatedToId?: string, relationType?: string }> = { 
    name: "", 
    birthDate: "", 
    gender: "male",
    role: "Member",
    description: "",
    relatedToId: "",
    relationType: "parent-child",
    photoUrl: ""
  };

  const [personForm, setPersonForm] = useState<Partial<Person & { relatedToId?: string, relationType?: string }>>(initialPersonState);

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

  const handleEdit = useCallback((person: Person) => {
    setPersonForm(person);
    setImagePreview(person.photoUrl || null);
    setIsEditMode(true);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((personId: string) => {
    if (!firestore || !user) return;
    const personRef = doc(firestore, "households", householdId, "persons", personId);
    deleteDocumentNonBlocking(personRef);
    toast({
      title: "Member removed",
      description: "The family member has been removed from the tree.",
    });
  }, [firestore, householdId, user, toast]);

  useEffect(() => {
    if (persons) {
      const newNodes: Node[] = persons.map((person: any, index: number) => {
        return {
          id: person.id,
          type: "familyMember",
          position: { x: index * 250, y: index * 150 },
          data: { 
            person,
            onEdit: handleEdit,
            onDelete: handleDelete
          },
        };
      });
      setNodes(newNodes);
    }
  }, [persons, setNodes, handleEdit, handleDelete]);

  useEffect(() => {
    if (relationships) {
      const newEdges: Edge[] = relationships.map((rel: any) => {
        return {
          id: rel.id,
          source: rel.person1Id,
          target: rel.person2Id,
          animated: rel.type === "parent-child",
          label: rel.type,
          style: { 
            stroke: rel.type === "spouse" ? 'hsl(var(--accent))' : 'hsl(var(--primary))', 
            strokeWidth: 3 
          },
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 1MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setPersonForm(prev => ({ ...prev, photoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!personForm.name || !user) return;

    const personData = {
      householdId,
      name: personForm.name,
      birthDate: personForm.birthDate || "",
      gender: personForm.gender,
      role: personForm.role,
      description: personForm.description || "",
      photoUrl: personForm.photoUrl || `https://picsum.photos/seed/${Date.now()}/200/200`,
      updatedAt: serverTimestamp(),
      householdMembers: { [user.uid]: "admin" }
    };

    if (isEditMode && personForm.id) {
      const personRef = doc(firestore, "households", householdId, "persons", personForm.id);
      updateDocumentNonBlocking(personRef, personData);
      toast({ title: "Profile updated" });
    } else {
      const personsRef = collection(firestore, "households", householdId, "persons");
      const docRef = await addDoc(personsRef, {
        ...personData,
        createdAt: serverTimestamp(),
        createdByUserId: user.uid,
      });

      if (personForm.relatedToId && personForm.relationType) {
        const relRef = collection(firestore, "households", householdId, "relationships");
        addDocumentNonBlocking(relRef, {
          householdId,
          person1Id: personForm.relationType === "parent-child" ? personForm.relatedToId : docRef.id,
          person2Id: personForm.relationType === "parent-child" ? docRef.id : personForm.relatedToId,
          type: personForm.relationType,
          createdAt: serverTimestamp(),
          createdByUserId: user.uid,
          householdMembers: { [user.uid]: "admin" }
        });
      }
      toast({ title: "Member added" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setIsEditMode(false);
    setImagePreview(null);
    setPersonForm(initialPersonState);
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
          <Button className="gap-2 shadow-lg" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            {t("tree.addPerson")}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-secondary/10 rounded-2xl border-2 border-dashed border-muted overflow-hidden relative shadow-inner">
        {isPersonsLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">Mapping your legacy...</p>
            </div>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Profile" : t("tree.addPerson")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary/20 group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={imagePreview || ""} />
                  <AvatarFallback className="bg-secondary">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Label 
                  htmlFor="photo-upload" 
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Label>
                <Input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">Profile Picture (Max 1MB)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={personForm.name} 
                  onChange={(e) => setPersonForm({...personForm, name: e.target.value})} 
                  placeholder="Full Name" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birth">Birth Date</Label>
                <Input 
                  id="birth" 
                  value={personForm.birthDate} 
                  onChange={(e) => setPersonForm({...personForm, birthDate: e.target.value})} 
                  placeholder="DD-MM-YYYY" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Gender</Label>
                <Select value={personForm.gender} onValueChange={(val) => setPersonForm({...personForm, gender: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Input 
                  value={personForm.role} 
                  onChange={(e) => setPersonForm({...personForm, role: e.target.value})} 
                  placeholder="e.g. Grandfather, Son" 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea 
                value={personForm.description} 
                onChange={(e) => setPersonForm({...personForm, description: e.target.value})} 
                placeholder="A short note about this person..."
                className="h-20"
              />
            </div>

            {!isEditMode && persons && persons.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-bold text-primary">Relationship Mapping</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Related To</Label>
                    <Select value={personForm.relatedToId} onValueChange={(val) => setPersonForm({...personForm, relatedToId: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relative" />
                      </SelectTrigger>
                      <SelectContent>
                        {persons.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Relation</Label>
                    <Select value={personForm.relationType} onValueChange={(val) => setPersonForm({...personForm, relationType: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Relation Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent-child">Child of</SelectItem>
                        <SelectItem value="spouse">Spouse of</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              {isEditMode ? "Update Profile" : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
