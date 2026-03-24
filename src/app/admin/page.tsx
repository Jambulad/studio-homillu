
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  collectionGroup, 
  query, 
  orderBy, 
  limit, 
  doc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldAlert, 
  Users, 
  Home, 
  CheckSquare, 
  ShoppingBag, 
  Trash2, 
  Search,
  Loader2,
  Database,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { redirect } from 'next/navigation';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Check if user is Dhileepudu (the Admin)
  const isAdmin = user?.email === 'dhileepudu@gmail.com';

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || !isAdmin) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have administrative privileges for this platform."
        });
        redirect('/');
      } else {
        setIsReady(true);
      }
    }
  }, [user, isUserLoading, isAdmin, toast]);

  // Admin Queries - Fetching everything across all families
  const householdsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'households'), limit(50));
  }, [firestore, isAdmin]);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    // Note: CollectionGroup queries require indices to be created in the Firebase Console
    return query(collectionGroup(firestore, 'tasks'), limit(50));
  }, [firestore, isAdmin]);

  const shoppingQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collectionGroup(firestore, 'shoppingListItems'), limit(50));
  }, [firestore, isAdmin]);

  const { data: households, isLoading: loadingHouseholds } = useCollection(householdsQuery);
  const { data: allTasks, isLoading: loadingTasks } = useCollection(tasksQuery);
  const { data: allShopping, isLoading: loadingShopping } = useCollection(shoppingQuery);

  const handleDeleteTask = async (householdId: string, taskId: string) => {
    if (!window.confirm("Are you sure you want to rectify this task by deleting it?")) return;
    try {
      const taskRef = doc(firestore, 'households', householdId, 'tasks', taskId);
      await deleteDoc(taskRef);
      toast({ title: "Task Rectified", description: "The item has been removed from the platform." });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed", description: "Admin write privileges check failed." });
    }
  };

  const handleDeleteShopping = async (householdId: string, itemId: string) => {
    if (!window.confirm("Delete this shopping record across the family hub?")) return;
    try {
      const itemRef = doc(firestore, 'households', householdId, 'shoppingListItems', itemId);
      await deleteDoc(itemRef);
      toast({ title: "Record Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not perform administrative delete." });
    }
  };

  if (isUserLoading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Authenticating Architect...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <h1 className="text-4xl font-black tracking-tighter text-foreground">
              Platform Command Center
            </h1>
          </div>
          <p className="text-muted-foreground font-medium mt-1">
            Signed in as Architect: <span className="text-primary font-bold">{user?.email}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-destructive/20 bg-destructive/5 text-destructive font-bold px-4 py-1">
            ADMIN MODE ACTIVE
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
              <Home className="h-4 w-4" /> Households
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{households?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-accent/60 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" /> Global Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{allTasks?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-teal-500/5 border-teal-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-teal-600/60 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Shopping Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{allShopping?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-destructive/60 flex items-center gap-2">
              <Database className="h-4 w-4" /> Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">Live</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-secondary/50 p-1 mb-6">
          <TabsTrigger value="tasks" className="gap-2 font-bold uppercase tracking-tighter text-xs">
            <CheckSquare className="h-4 w-4" /> All Family Tasks
          </TabsTrigger>
          <TabsTrigger value="shopping" className="gap-2 font-bold uppercase tracking-tighter text-xs">
            <ShoppingBag className="h-4 w-4" /> All Shopping Items
          </TabsTrigger>
          <TabsTrigger value="households" className="gap-2 font-bold uppercase tracking-tighter text-xs">
            <Home className="h-4 w-4" /> Family Hubs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="border-muted/50">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Global Task Monitoring</CardTitle>
                  <CardDescription>View and manage all family tasks across the ecosystem.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by title..." 
                    className="pl-9 h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingTasks ? (
                <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
              ) : (
                <div className="divide-y">
                  {allTasks?.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map((task: any) => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{task.title}</h4>
                          <Badge variant={task.isCompleted ? "secondary" : "outline"} className="text-[8px] h-4">
                            {task.isCompleted ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="font-bold text-primary">HUB: {task.householdId}</span>
                          <span>•</span>
                          <span>By: {task.assignedToName || 'Unknown'}</span>
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTask(task.householdId, task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {allTasks?.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground italic text-sm">No tasks found in the database.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopping" className="space-y-4">
          <Card className="border-muted/50">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg font-bold">Global Shopping Logistics</CardTitle>
              <CardDescription>Oversee shopping lists across all households.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingShopping ? (
                <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
              ) : (
                <div className="divide-y">
                  {allShopping?.map((item: any) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <span className="text-xs font-medium text-muted-foreground">x{item.quantity}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase">
                          HUB: {item.householdId}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteShopping(item.householdId, item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {allShopping?.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground italic text-sm">No shopping items found.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="households" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {households?.map((hh: any) => (
              <Card key={hh.id} className="border-muted/50 shadow-sm hover:border-primary/30 transition-all">
                <CardHeader>
                  <CardTitle className="text-md flex items-center justify-between">
                    {hh.name}
                    <Badge className="bg-primary/10 text-primary border-none text-[8px]">ACTIVE HUB</Badge>
                  </CardTitle>
                  <CardDescription className="text-[10px] font-mono">{hh.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-2 rounded-lg text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Members</p>
                      <p className="font-black">{Object.keys(hh.members || {}).length}</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-lg text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Created</p>
                      <p className="font-bold text-xs">{hh.createdAt?.toDate ? hh.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between items-center border-t border-dashed">
                    <p className="text-[10px] text-muted-foreground">Owner UID: {hh.ownerId}</p>
                    <Button variant="ghost" size="sm" className="text-xs gap-1 group">
                      Inspect Hub <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-6 bg-destructive/5 border-2 border-dashed border-destructive/20 rounded-3xl flex items-center gap-6">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h4 className="font-black text-destructive uppercase tracking-tighter">Architect's Note</h4>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Administrative actions are logged and final. Deleting tasks or shopping lists here will remove them permanently from the families' shared hubs. Use these tools primarily for platform maintenance and rectifying database anomalies.
          </p>
        </div>
      </div>
    </div>
  );
}
