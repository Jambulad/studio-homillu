
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
import { Plus, GitBranch, Share2, Info, Loader2, Camera, Database, Trash2, CloudUpload } from "lucide-react";
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
import { collection, serverTimestamp, doc, addDoc, setDoc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

const nodeTypes = {
  familyMember: TreeNode,
};

// Legacy Data Constants
const LEGACY_DATA = {
  "fname": "Changal Rayudu",
  "DOB": "",
  "spouse": "Wife: Eeramma",
  "photo": "",
  "children": [
    {
      "fname": "Govindu",
      "DOB": "",
      "spouse": "Wife: Sulochana",
      "photo": "",
      "children": [
        {
          "fname": "Ravinder",
          "DOB": "",
          "spouse": "Wife: Sulochana",
          "photo": "",
          "children": [
            {
              "fname": "Chandrakala",
              "DOB": "",
              "spouse": "Husband: Ashok Kumar",
              "photo": "",
              "children": [
                {
                  "fname": "Vasrha Yadav",
                  "DOB": "",
                  "spouse": "",
                  "photo": ""
                },
                {
                  "fname": "Daughter2",
                  "DOB": "",
                  "spouse": "",
                  "photo": ""
                },
                {
                  "fname": "Daughter3",
                  "DOB": "",
                  "spouse": "",
                  "photo": ""
                }
              ]
            },
            {
              "fname": "Ramana",
              "DOB": "",
              "spouse": "Wife: Geetha",
              "photo": "",
              "children": [
                {
                  "fname": "Rakesh",
                  "DOB": "",
                  "spouse": "",
                  "photo": ""
                },
                {
                  "fname": "Poojitha",
                  "DOB": "",
                  "spouse": "",
                  "photo": ""
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "fname": "Krishnappa",
      "DOB": "",
      "spouse": "Wife: ???",
      "photo": ""
    },
    {
      "fname": "Kuppamma",
      "DOB": "",
      "spouse": "Husband: Anjineyulu ",
      "photo": "",
      "children": [
        {
          "fname": "Kamala",
          "DOB": "",
          "spouse": "Husband: ???",
          "photo": ""
        },
        {
          "fname": "Aruna (Tamil Nadu)",
          "DOB": "",
          "spouse": "",
          "photo": ""
        },
        {
          "fname": "Sulochana (Balu Uncle valla Ammagaru)",
          "DOB": "",
          "spouse": "Husband: ???",
          "photo": ""
        },
        {
          "fname": "Indira (Late, Gtl)",
          "DOB": "",
          "spouse": "",
          "photo": ""
        },
        {
          "fname": "Jaya ()",
          "DOB": "",
          "spouse": "",
          "photo": ""
        },
        {
          "fname": "Satish (Gtl)",
          "DOB": "",
          "spouse": "Wife: Uma (daughter of Seenappa)",
          "photo": "",
          "children": [
            {
              "fname": "Sirisha",
              "DOB": "",
              "spouse": "Husband: Shiva",
              "photo": "",
              "children": [
                {
                  "fname": "Daughter",
                  "DOB": "",
                  "spouse": "",
                  "photo": ""
                }
              ]
            }
          ]
        },
        {
          "fname": "Krishna Murthy ",
          "DOB": "",
          "spouse": "Wife:",
          "photo": ""
        }
      ]
    },
    {
      "fname": "Seenappa",
      "DOB": "",
      "spouse": "Wife: Papamma",
      "photo": "",
      "children": [
        {
          "fname": "Padma (Mumbai)",
          "DOB": "",
          "spouse": "Husband: Adhikeshavulu",
          "photo": "",
          "children": [
            {
              "fname": "Revathi",
              "DOB": "",
              "spouse": "",
              "photo": ""
            },
            {
              "fname": "Rajesh",
              "DOB": "",
              "spouse": "",
              "photo": ""
            },
            {
              "fname": "Bharathi",
              "DOB": "",
              "spouse": "",
              "photo": ""
            },
            {
              "fname": "Mallathi",
              "DOB": "",
              "spouse": "",
              "photo": ""
            }
          ]
        },
        {
          "fname": "Aruna (Ambathur, Tamil Nadu)",
          "DOB": "",
          "spouse": "Venu Gopalan",
          "photo": "",
          "children": [
            {
              "fname": "Vydehi",
              "DOB": "",
              "spouse": "",
              "photo": ""
            },
            {
              "fname": "Son(Lt)",
              "DOB": "",
              "spouse": "",
              "photo": ""
            }
          ]
        },
        {
          "fname": "Sathish (Bengaluru)",
          "DOB": "",
          "spouse": "Rani",
          "photo": "",
          "children": [
            {
              "fname": "Jayadev",
              "DOB": "",
              "spouse": "",
              "photo": "",
              "children": [
                {
                  "fname": "Son",
                  "DOB": "",
                  "spouse": "",
                  "photo": ""
                }
              ]
            },
            {
              "fname": "Poornima",
              "DOB": "",
              "spouse": "",
              "photo": ""
            },
            {
              "fname": "Manjunath",
              "DOB": "",
              "spouse": "",
              "photo": "",
              "children": [
                {
                  "fname": "Son",
                  "DOB": "",
                  "spouse": "",
                  "photo": ""
                }
              ]
            }
          ]
        },
        {
          "fname": "Uma (Late, Gtl)",
          "DOB": "",
          "spouse": "",
          "photo": ""
        },
        {
          "fname": "Vasantha (Mumbai)",
          "DOB": "",
          "spouse": "",
          "photo": ""
        }
      ]
    },
    {
      "fname": "Chandraiah ",
      "DOB": "1922",
      "spouse": "Wife: Laxmamma (1928)",
      "photo": "",
      "children": [
        {
          "fname": "Sreerama Murthy ",
          "DOB": "1956",
          "spouse": "Wife: Padmavathamma (1963)",
          "photo": "",
          "children": [
            {
              "fname": "Dilip ",
              "DOB": "1984",
              "spouse": "Wife: Harshitha (1987)",
              "photo": "",
              "children": [
                {
                  "fname": "Vaishnavi ",
                  "DOB": "26/06/2014",
                  "spouse": "",
                  "photo": ""
                },
                {
                  "fname": "Dhruthi ",
                  "DOB": "15/12/2018",
                  "spouse": "",
                  "photo": ""
                }
              ]
            },
            {
              "fname": "Nikhil ",
              "DOB": "1986",
              "spouse": "Wife: Anahita (1992)",
              "photo": "",
              "children": [
                {
                  "fname": "Adhithi ",
                  "DOB": "21/02/2018",
                  "spouse": "",
                  "photo": ""
                },
                {
                  "fname": "Advaith ",
                  "DOB": "05/02/2018",
                  "spouse": "",
                  "photo": ""
                }
              ]
            }
          ]
        },
        {
          "fname": "Asha Latha",
          "DOB": "",
          "spouse": "Husband: Manohar",
          "photo": "",
          "children": [
            {
              "fname": "Anisha Thella",
              "DOB": "1987",
              "spouse": "Husband: Ravi Jangiti",
              "photo": "",
              "children": [
                {
                  "fname": "Avi Thella",
                  "DOB": "2015",
                  "spouse": "",
                  "photo": ""
                },
                {
                  "fname": "Ashrav",
                  "DOB": "2020",
                  "spouse": "",
                  "photo": ""
                }
              ]
            },
            {
              "fname": "Manasa Thella",
              "DOB": "1990",
              "spouse": "Vivek",
              "photo": "",
              "children": [
                {
                  "fname": "Vicky",
                  "DOB": "2020",
                  "spouse": "",
                  "photo": ""
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "fname": "Purushotham",
      "DOB": "",
      "spouse": "Wife: ???",
      "photo": "",
      "children": [
        {
          "fname": "Raja (Tirupathi)",
          "DOB": "",
          "spouse": "Wife: ???",
          "photo": ""
        },
        {
          "fname": "Ranga ",
          "DOB": "",
          "spouse": "Wife: ???",
          "photo": ""
        },
        {
          "fname": "Loka (Bellary)",
          "DOB": "",
          "spouse": "Wife: ",
          "photo": ""
        },
        {
          "fname": "Sathya ",
          "DOB": "",
          "spouse": "Wife: ???",
          "photo": ""
        }
      ]
    },
    {
      "fname": "Adhikeshavulu",
      "DOB": "",
      "spouse": "Wife: Kamallamma",
      "photo": "",
      "children": [
        {
          "fname": "Usha (Hyd)",
          "DOB": "",
          "spouse": "Husband: ???",
          "photo": ""
        },
        {
          "fname": "Suvi (Hyd)",
          "DOB": "",
          "spouse": "Husband: Srinath",
          "photo": ""
        },
        {
          "fname": "Sridevi (Hyd)",
          "DOB": "",
          "spouse": "Husband: ",
          "photo": ""
        },
        {
          "fname": "Parvathi ",
          "DOB": "",
          "spouse": "Husband: ",
          "photo": ""
        }
      ]
    },
    {
      "fname": "Siblings of Eeramma ",
      "DOB": "",
      "spouse": "1.Viraswamy(His son is Anjenyulu who is Kuppamma's Husband), 2.Sriptahi, 3.One More Son",
      "photo": ""
    }
  ]
};

export default function FamilyTreePage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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

  const handleBulkImport = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in to publish your tree data." });
      return;
    }
    
    setIsImporting(true);

    try {
      // Ensure the root household document exists for the user
      const householdRef = doc(firestore, "households", user.uid);
      await setDoc(householdRef, {
        id: user.uid,
        name: `${user.displayName}'s Family`,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        members: { [user.uid]: "admin" }
      }, { merge: true });

      const importNode = async (node: any, parentId?: string) => {
        // Create primary person
        const personData = {
          householdId: user.uid,
          name: node.fname,
          birthDate: node.DOB || "",
          gender: "male", 
          role: "Family Member",
          photoUrl: `https://picsum.photos/seed/${node.fname}/200/200`,
          createdAt: serverTimestamp(),
          createdByUserId: user.uid,
          householdMembers: { [user.uid]: "admin" }
        };

        const personsRef = collection(firestore, "households", user.uid, "persons");
        const docRef = await addDoc(personsRef, personData);
        const personId = docRef.id;

        // Create relationship to parent
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

        // Handle spouse
        if (node.spouse && node.spouse.trim() !== "" && !node.spouse.endsWith(":")) {
          const spouseLabel = node.spouse.toLowerCase().includes("wife") ? "Wife" : (node.spouse.toLowerCase().includes("husband") ? "Husband" : "Spouse");
          const spouseName = node.spouse.replace(/Wife:|Husband:/gi, '').trim();
          
          if (spouseName && spouseName !== "???" && spouseName !== "") {
            const spouseDoc = await addDoc(personsRef, {
              householdId: user.uid,
              name: spouseName,
              birthDate: "",
              gender: spouseLabel === "Wife" ? "female" : "male",
              role: spouseLabel,
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

        // Recursively handle children
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            await importNode(child, personId);
          }
        }
      };

      await importNode(LEGACY_DATA);
      toast({
        title: "Tree Published!",
        description: "Your lineage has been successfully synchronized and published to the cloud.",
      });
    } catch (e: any) {
      console.error("Bulk Import Error:", e);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: e.message || "There was an error publishing your records. Please check your connection.",
      });
    } finally {
      setIsImporting(false);
    }
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
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 shadow-sm"
            onClick={handleBulkImport}
            disabled={isImporting || !user}
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
            {isImporting ? "Publishing..." : "Publish Legacy Tree"}
          </Button>
          <Button className="gap-2 shadow-lg" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            {t("tree.addPerson")}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-secondary/10 rounded-2xl border-2 border-dashed border-muted overflow-hidden relative shadow-inner">
        {(isPersonsLoading || isImporting) ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-2xl shadow-2xl border border-primary/20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-bold">
                  {isImporting ? "Synchronizing Records..." : "Connecting to Database..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isImporting ? "Building lineage relationships from legacy data" : "Mapping your family's heritage"}
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
            <Controls className="fill-primary" />
            <MiniMap 
              nodeColor={(node) => 'hsl(var(--primary))'}
              maskColor="rgba(0, 0, 0, 0.1)"
              className="border-primary/20 bg-background/50 rounded-lg shadow-lg"
            />
            <Panel position="bottom-center" className="bg-background/80 backdrop-blur-md p-4 rounded-xl border shadow-xl flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bloodline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-accent border-dashed border-t" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Marriage</span>
              </div>
              <div className="flex items-center gap-2 ml-4 text-xs text-muted-foreground italic border-l pl-4">
                <Info className="h-3.5 w-3.5" />
                Drag nodes to reorganize tree structure
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
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Profile Picture (Max 1MB)</p>
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

            {!isEditMode && persons && persons.length > 0 && (
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
                        {persons.map((p: any) => (
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
            <Button onClick={handleSave} className="w-full sm:w-auto font-bold px-8 py-6 text-lg">
              {isEditMode ? "Update Profile" : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
