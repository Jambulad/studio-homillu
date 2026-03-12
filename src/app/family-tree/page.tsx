
"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  Panel,
  useReactFlow,
  ReactFlowProvider
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TreeNode, Person } from "@/components/features/family-tree/tree-node";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  GitBranch, 
  Info, 
  Loader2, 
  Camera, 
  Database, 
  CloudUpload, 
  FileJson, 
  Code, 
  Mail,
  LayoutGrid,
  Network
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, addDoc, setDoc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendFamilyInvitation } from "@/ai/flows/send-family-invitation";

const nodeTypes = {
  familyMember: TreeNode,
};

const JSON_TEMPLATE = {
  "fname": "Full Name",
  "DOB": "Year or Date",
  "spouse": "Wife: Name OR Husband: Name",
  "description": "Short biography of the person",
  "children": [
    {
      "fname": "Child Name",
      "DOB": "Year",
      "description": "Bio for child",
      "children": []
    }
  ]
};

const DUMMY_PERSONS = [
  { id: "d1", name: "Jambula Chandraiah", birthDate: "1922", role: "Head of Family", gender: "male", description: "The patriarch of the family.", photoUrl: "https://picsum.photos/seed/chandraiah/200/200", isConfirmed: true },
  { id: "d2", name: "Jambula Laxmamma", birthDate: "1928", role: "Matriarch", gender: "female", description: "The matriarch of the family.", photoUrl: "https://picsum.photos/seed/laxmamma/200/200", isConfirmed: true },
  { id: "d3", name: "Jambula Sreerama Murthy", birthDate: "1956", role: "Son", gender: "male", description: "Elder son of Chandraiah and Laxmamma.", photoUrl: "https://picsum.photos/seed/murthy/200/200", isConfirmed: true },
  { id: "d4", name: "Jambula Latha", birthDate: "1960", role: "Daughter", gender: "female", description: "Daughter of Chandraiah and Laxmamma.", photoUrl: "https://picsum.photos/seed/latha/200/200", email: "latha@example.com", isConfirmed: false },
];

const DUMMY_RELATIONSHIPS = [
  { id: "r1", person1Id: "d1", person2Id: "d2", type: "spouse" },
  { id: "r2", person1Id: "d1", person2Id: "d3", type: "parent-child" },
  { id: "r3", person1Id: "d1", person2Id: "d4", type: "parent-child" },
];

function FamilyTreeContent() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { fitView } = useReactFlow();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [importStep, setImportStep] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedJson, setUploadedJson] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"free" | "org">("org");
  
  const initialPersonState: Partial<Person & { relatedToId?: string, relationType?: string }> = useMemo(() => ({ 
    name: "", 
    email: "",
    isConfirmed: false,
    birthDate: "", 
    gender: "male",
    role: "Member",
    description: "",
    relatedToId: "",
    relationType: "parent-child",
    photoUrl: ""
  }), []);

  const [personForm, setPersonForm] = useState<Partial<Person & { relatedToId?: string, relationType?: string }>>(initialPersonState);

  const householdId = user?.uid || "placeholder";

  const personsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "persons");
  }, [firestore, user, householdId]);

  const relationshipsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "relationships");
  }, [firestore, user, householdId]);

  const { data: cloudPersons, isLoading: isPersonsLoading } = useCollection(personsQuery);
  const { data: cloudRelationships, isLoading: isRelLoading } = useCollection(relationshipsQuery);

  const displayPersons = user ? (cloudPersons || []) : DUMMY_PERSONS;
  const displayRelationships = user ? (cloudRelationships || []) : DUMMY_RELATIONSHIPS;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleEdit = useCallback((person: Person) => {
    if (!person.id || person.id.startsWith("d")) {
      toast({ title: "Preview Mode", description: "Sign in to edit family profiles." });
      return;
    }
    setPersonForm(person);
    setImagePreview(person.photoUrl || null);
    setIsEditMode(true);
    setIsDialogOpen(true);
  }, [toast]);

  const handleDelete = useCallback((personId: string) => {
    if (!user || personId.startsWith("d")) {
      toast({ title: "Preview Mode", description: "Sign in to delete family profiles." });
      return;
    }
    const personRef = doc(firestore, "households", householdId, "persons", personId);
    deleteDocumentNonBlocking(personRef);
    toast({ title: "Member removed" });
  }, [firestore, householdId, user, toast]);

  const layoutNodes = useCallback((persons: any[], relationships: any[], mode: "free" | "org") => {
    if (mode === "free") {
      return persons.map((person, index) => ({
        id: person.id,
        type: "familyMember",
        position: { x: (index % 4) * 280, y: Math.floor(index / 4) * 250 },
        data: { person, onEdit: handleEdit, onDelete: handleDelete },
      }));
    }

    const nodeMap = new Map();
    const childrenMap = new Map();
    const spouseMap = new Map();
    const roots = new Set(persons.map(p => p.id));

    relationships.forEach(rel => {
      if (rel.type === "parent-child") {
        const children = childrenMap.get(rel.person1Id) || [];
        children.push(rel.person2Id);
        childrenMap.set(rel.person1Id, children);
        roots.delete(rel.person2Id);
      } else if (rel.type === "spouse") {
        spouseMap.set(rel.person1Id, rel.person2Id);
        spouseMap.set(rel.person2Id, rel.person1Id);
      }
    });

    const calculatedNodes: Node[] = [];
    const visited = new Set();
    const levelWidths = new Map();

    const processNode = (id: string, level: number, xOffset: number) => {
      if (visited.has(id)) return;
      visited.add(id);

      const person = persons.find(p => p.id === id);
      if (!person) return;

      const currentWidth = levelWidths.get(level) || 0;
      const x = currentWidth + xOffset;
      levelWidths.set(level, currentWidth + 300);

      calculatedNodes.push({
        id: person.id,
        type: "familyMember",
        position: { x, y: level * 300 },
        data: { person, onEdit: handleEdit, onDelete: handleDelete },
      });

      const spouseId = spouseMap.get(id);
      if (spouseId && !visited.has(spouseId)) {
        processNode(spouseId, level, 0);
      }

      const children = childrenMap.get(id) || [];
      children.forEach((childId: string, idx: number) => {
        processNode(childId, level + 1, idx * 50);
      });
    };

    Array.from(roots).forEach((rootId: any) => processNode(rootId, 0, 0));

    persons.forEach(p => {
      if (!visited.has(p.id)) processNode(p.id, 0, 0);
    });

    return calculatedNodes;
  }, [handleEdit, handleDelete]);

  // Use a ref to track if we've already done an initial fitView for a set of data
  const lastDataHash = useRef("");

  useEffect(() => {
    if (displayPersons && displayRelationships) {
      const currentHash = `${displayPersons.length}-${displayRelationships.length}-${viewMode}`;
      
      const newNodes = layoutNodes(displayPersons, displayRelationships, viewMode);
      setNodes(newNodes);
      
      const newEdges: Edge[] = displayRelationships.map((rel: any) => {
        const isSpouse = rel.type === "spouse";
        return {
          id: rel.id,
          source: rel.person1Id,
          target: rel.person2Id,
          animated: false,
          label: rel.type,
          style: { 
            stroke: isSpouse ? 'hsl(var(--accent))' : 'hsl(var(--primary))', 
            strokeWidth: 3,
            strokeDasharray: isSpouse ? '5,5' : '0'
          },
        };
      });
      setEdges(newEdges);
      
      if (lastDataHash.current !== currentHash) {
        lastDataHash.current = currentHash;
        // fitView should be called after a short delay to allow React Flow to process nodes
        setTimeout(() => {
          fitView({ padding: 0.2, duration: 800 });
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPersons, displayRelationships, viewMode, layoutNodes]); 
  // We explicitly exclude setNodes, setEdges, and fitView from deps to avoid instability loops.
  // These are assumed stable or managed manually within the effect.

  const onConnect = useCallback(
    (params: Connection) => {
      if (!user) {
        toast({ title: "Sign in required", description: "Sign in to create bloodline or spouse links." });
        return;
      }
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
    [firestore, householdId, user, toast]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Please select an image smaller than 1MB." });
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

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        toast({ variant: "destructive", title: "Invalid file type", description: "Please upload a .json file." });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setUploadedJson(json);
          toast({ title: "JSON Loaded", description: "Ready to import legacy records." });
        } catch (err) {
          toast({ variant: "destructive", title: "Parse Error", description: "Invalid JSON format in file." });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save your family tree." });
      return;
    }
    if (!personForm.name) return;

    const personData = {
      householdId,
      name: personForm.name,
      email: personForm.email || "",
      isConfirmed: personForm.isConfirmed || false,
      birthDate: personForm.birthDate || "",
      gender: personForm.gender,
      role: personForm.role,
      description: personForm.description || "",
      photoUrl: personForm.photoUrl || `https://picsum.photos/seed/${Date.now()}/200/200`,
      updatedAt: serverTimestamp(),
      householdMembers: { [user.uid]: "admin" }
    };

    try {
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
        
        if (personForm.email && personForm.email.trim() !== "") {
          setIsInviting(true);
          await sendFamilyInvitation({
            personName: personForm.name,
            invitedBy: user.displayName || "A Family Member",
            householdName: `${user.displayName}'s Family`,
            email: personForm.email
          });
          toast({ title: "Invitation Sent", description: `A consent email has been simulated for ${personForm.name}.` });
        }
        
        toast({ title: "Member added" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleBulkImport = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Sign In Required", description: "You must be signed in to import family records to the cloud." });
      return;
    }
    if (!uploadedJson) {
      toast({ variant: "destructive", title: "Action Required", description: "Please upload a JSON file first." });
      return;
    }
    
    setIsImporting(true);
    setImportStep("Initializing Household...");

    try {
      const householdRef = doc(firestore, "households", user.uid);
      await setDoc(householdRef, {
        id: user.uid,
        name: `${user.displayName}'s Family`,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        members: { [user.uid]: "admin" }
      }, { merge: true });

      const importNode = async (node: any, parentId?: string) => {
        setImportStep(`Importing ${node.fname}...`);
        
        const personData = {
          householdId: user.uid,
          name: node.fname,
          birthDate: node.DOB || "",
          description: node.description || "",
          gender: "male", 
          role: "Family Member",
          isConfirmed: false,
          photoUrl: `https://picsum.photos/seed/${node.fname}/200/200`,
          createdAt: serverTimestamp(),
          createdByUserId: user.uid,
          householdMembers: { [user.uid]: "admin" }
        };

        const personsRef = collection(firestore, "households", user.uid, "persons");
        const docRef = await addDoc(personsRef, personData);
        const personId = docRef.id;

        if (parentId) {
          const relRef = collection(firestore, "households", user.uid, "relationships");
          await addDoc(relRef, {
            householdId: user.uid,
            person1Id: parentId,
            person2Id: personId,
            type: "parent-child",
            createdAt: serverTimestamp(),
            createdByUserId: user.uid,
            householdMembers: { [user.uid]: "admin" }
          });
        }

        if (node.spouse && node.spouse.trim() !== "" && !node.spouse.endsWith(":")) {
          const spouseLabel = node.spouse.toLowerCase().includes("wife") ? "Wife" : (node.spouse.toLowerCase().includes("husband") ? "Husband" : "Spouse");
          const spouseName = node.spouse.replace(/Wife:|Husband:/gi, '').trim();
          
          if (spouseName && spouseName !== "???" && spouseName !== "") {
            const spouseDoc = await addDoc(personsRef, {
              householdId: user.uid,
              name: spouseName,
              birthDate: "",
              description: node.spouseDescription || "",
              gender: spouseLabel === "Wife" ? "female" : "male",
              role: spouseLabel,
              isConfirmed: false,
              photoUrl: `https://picsum.photos/seed/${spouseName}/200/200`,
              createdAt: serverTimestamp(),
              createdByUserId: user.uid,
              householdMembers: { [user.uid]: "admin" }
            });

            await addDoc(collection(firestore, "households", user.uid, "relationships"), {
              householdId: user.uid,
              person1Id: personId,
              person2Id: spouseDoc.id,
              type: "spouse",
              createdAt: serverTimestamp(),
              createdByUserId: user.uid,
              householdMembers: { [user.uid]: "admin" }
            });
          }
        }

        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            await importNode(child, personId);
          }
        }
      };

      await importNode(uploadedJson);
      toast({ title: "Import Success", description: "Your lineage has been successfully synchronized." });
      setIsImportDialogOpen(false);
      setUploadedJson(null);
    } catch (e: any) {
      console.error("Bulk Import Error:", e);
      toast({ variant: "destructive", title: "Sync Failed", description: e.message || "There was an error importing your records." });
    } finally {
      setIsImporting(false);
      setImportStep("");
    }
  };

  const resetForm = useCallback(() => {
    setIsEditMode(false);
    setImagePreview(null);
    setPersonForm(initialPersonState);
  }, [initialPersonState]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
              <GitBranch className="h-8 w-8" />
              {t("tree.title")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("tree.description")}
            </p>
          </div>
          <Tabs value={viewMode} onValueChange={(val: any) => setViewMode(val)} className="hidden sm:block">
            <TabsList className="bg-secondary/50 p-1">
              <TabsTrigger value="org" className="gap-2">
                <Network className="h-4 w-4" />
                Org Chart
              </TabsTrigger>
              <TabsTrigger value="free" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Family Chart
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 shadow-sm"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <FileJson className="h-4 w-4" />
            Bulk Import
          </Button>
          <Button className="gap-2 shadow-lg" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            {t("tree.addPerson")}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-secondary/10 rounded-2xl border-2 border-dashed border-muted overflow-hidden relative shadow-inner">
        {!user && (
          <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-4 py-2 rounded-lg border shadow-lg text-xs font-bold text-primary flex items-center gap-2">
            <Info className="h-4 w-4" />
            PREVIEW MODE: Sign in to save your personal family tree.
          </div>
        )}
        {(isPersonsLoading || isImporting) ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-2xl shadow-2xl border border-primary/20 max-w-sm w-full mx-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-bold">
                  {isImporting ? "Processing JSON Records..." : "Connecting to Database..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {importStep || (isImporting ? "Building hierarchical links" : "Mapping your family's heritage")}
                </p>
              </div>
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
            <Controls showInteractive={false} />
            <MiniMap 
              nodeColor={() => 'hsl(var(--primary))'}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Panel position="bottom-center" className="bg-background/80 backdrop-blur-md p-4 rounded-xl border shadow-xl flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bloodline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-accent border-dashed border-t" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Marriage</span>
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              {isEditMode ? "Update Member Profile" : t("tree.addPerson")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-primary/20 group-hover:border-primary/50 transition-colors shadow-lg">
                  <AvatarImage src={imagePreview || ""} />
                  <AvatarFallback className="bg-secondary">
                    <Camera className="h-10 w-10 text-muted-foreground opacity-50" />
                  </AvatarFallback>
                </Avatar>
                <Label 
                  htmlFor="photo-upload" 
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-xl hover:bg-primary/90 transition-transform active:scale-95"
                >
                  <Plus className="h-5 w-5" />
                </Label>
                <Input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input 
                  id="name" 
                  value={personForm.name} 
                  onChange={(e) => setPersonForm({...personForm, name: e.target.value})} 
                  placeholder="Enter name" 
                  className="bg-secondary/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birth" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Birth Year/Date</Label>
                <Input 
                  id="birth" 
                  value={personForm.birthDate} 
                  onChange={(e) => setPersonForm({...personForm, birthDate: e.target.value})} 
                  placeholder="e.g. 1950" 
                  className="bg-secondary/20"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Mail className="h-3 w-3" />
                Invitation Email
              </Label>
              <Input 
                id="email" 
                type="email"
                value={personForm.email} 
                onChange={(e) => setPersonForm({...personForm, email: e.target.value})} 
                placeholder="Consent required for hub access" 
                className="bg-secondary/20"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-dashed">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Has Confirmed?</Label>
                <p className="text-[10px] text-muted-foreground">Manually verify consent status</p>
              </div>
              <Switch 
                checked={personForm.isConfirmed} 
                onCheckedChange={(checked) => setPersonForm({...personForm, isConfirmed: checked})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</Label>
                <Select value={personForm.gender} onValueChange={(val) => setPersonForm({...personForm, gender: val})}>
                  <SelectTrigger className="bg-secondary/20">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Family Role</Label>
                <Input 
                  value={personForm.role} 
                  onChange={(e) => setPersonForm({...personForm, role: e.target.value})} 
                  placeholder="e.g. Grandfather" 
                  className="bg-secondary/20"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Short Biography</Label>
              <Textarea 
                value={personForm.description} 
                onChange={(e) => setPersonForm({...personForm, description: e.target.value})} 
                placeholder="Briefly describe this family member..."
                className="h-24 bg-secondary/20 resize-none"
              />
            </div>

            {!isEditMode && displayPersons.length > 0 && (
              <div className="border-t pt-6 space-y-4">
                <p className="text-sm font-black text-primary uppercase tracking-tighter">Immediate Relationship Mapping</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related To</Label>
                    <Select value={personForm.relatedToId} onValueChange={(val) => setPersonForm({...personForm, relatedToId: val})}>
                      <SelectTrigger className="bg-secondary/20">
                        <SelectValue placeholder="Choose relative" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayPersons.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Relation Type</Label>
                    <Select value={personForm.relationType} onValueChange={(val) => setPersonForm({...personForm, relationType: val})}>
                      <SelectTrigger className="bg-secondary/20">
                        <SelectValue placeholder="Relation" />
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
          <DialogFooter className="pt-4 border-t">
            <Button onClick={handleSave} disabled={isInviting} className="w-full sm:w-auto font-bold px-8 py-6 text-lg gap-2">
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEditMode ? "Update Profile" : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileJson className="h-6 w-6 text-primary" />
              Bulk Legacy Import
            </DialogTitle>
            <DialogDescription>
              Upload a JSON file following the structure below to import your entire family lineage at once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Code className="h-3 w-3" />
                Required JSON Structure
              </Label>
              <ScrollArea className="h-48 w-full rounded-md border bg-slate-950 p-4">
                <pre className="text-xs text-blue-400 font-mono">
                  {JSON.stringify(JSON_TEMPLATE, null, 2)}
                </pre>
              </ScrollArea>
            </div>

            <div className="border-2 border-dashed border-muted rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors bg-secondary/5">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CloudUpload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold">Select JSON File</p>
                <p className="text-xs text-muted-foreground mt-1">Maximum file size: 2MB</p>
              </div>
              <Input 
                type="file" 
                accept=".json" 
                className="max-w-[200px] cursor-pointer"
                onChange={handleJsonUpload}
              />
              {uploadedJson && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
                  <Info className="h-3 w-3" />
                  File Ready: {uploadedJson.fname}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkImport} 
              disabled={!uploadedJson || isImporting}
              className="gap-2 font-bold"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              {isImporting ? "Importing Records..." : "Start Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FamilyTreePage() {
  return (
    <ReactFlowProvider>
      <FamilyTreeContent />
    </ReactFlowProvider>
  );
}
