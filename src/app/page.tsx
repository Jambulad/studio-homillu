"use client"

import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  CheckSquare, 
  ShoppingBag, 
  Calendar, 
  GitBranch, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Moon,
  Database,
  Users,
  CheckCircle2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getMoonPhase } from "@/lib/lunar-utils";
import { useState, useEffect, useMemo } from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, where, doc, updateDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Synchronized dummy data constants to match sub-pages
const DUMMY_TASKS = [
  { id: "d1", title: "Water the indoor plants", isCompleted: false },
  { id: "d2", title: "Buy groceries for dinner", isCompleted: true },
  { id: "d3", title: "Clean the backyard", isCompleted: false },
];

const DUMMY_ITEMS = [
  { id: "d1", name: "Whole Milk" },
  { id: "d2", name: "Brown Eggs" },
  { id: "d3", name: "Sourdough Bread" },
  { id: "d4", name: "Red Apples" },
];

const DUMMY_PERSONS = [
  { id: "d1", name: "Jambula Chandraiah" },
  { id: "d2", name: "Jambula Laxmamma" },
  { id: "d3", name: "Jambula Sreerama Murthy" },
  { id: "d4", name: "Jambula Latha" },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [moonData, setMoonData] = useState<ReturnType<typeof getMoonPhase> | null>(null);
  const [invitation, setInvitation] = useState<any | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setMoonData(getMoonPhase());
  }, []);

  const householdId = user?.uid || "default";

  // Real-time data queries
  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "tasks");
  }, [firestore, user, householdId]);

  const shoppingQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "shoppingListItems");
  }, [firestore, user, householdId]);

  const personsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "persons");
  }, [firestore, user, householdId]);

  // Invitation Search Logic - We target unconfirmed records matching user's email
  const invitationsQuery = useMemoFirebase(() => {
    // Crucially, only trigger this if the user is logged in AND has an email
    // This prevents permission errors during early auth initialization
    if (!firestore || !user?.email) return null;
    
    return query(
      collectionGroup(firestore, "persons"),
      where("email", "==", user.email),
      where("isConfirmed", "==", false)
    );
  }, [firestore, user?.email]);

  const { data: tasks, isLoading: tasksLoading } = useCollection(tasksQuery);
  const { data: shopping, isLoading: shoppingLoading } = useCollection(shoppingQuery);
  const { data: persons, isLoading: personsLoading } = useCollection(personsQuery);
  const { data: pendingInvitations } = useCollection(invitationsQuery);

  // Check for the first unconfirmed invitation
  useEffect(() => {
    if (pendingInvitations && pendingInvitations.length > 0) {
      setInvitation(pendingInvitations[0]);
    } else {
      setInvitation(null);
    }
  }, [pendingInvitations]);

  const handleConfirmInvitation = async () => {
    if (!invitation || !firestore) return;
    setIsConfirming(true);
    try {
      // Use the householdId and personId from the invitation document
      const personRef = doc(firestore, "households", invitation.householdId, "persons", invitation.id);
      await updateDoc(personRef, { isConfirmed: true });
      
      toast({
        title: "Welcome to the Family!",
        description: `You are now a confirmed member of your family hub.`,
      });
      setInvitation(null);
    } catch (error) {
      console.error("Confirmation Error:", error);
      toast({
        variant: "destructive",
        title: "Confirmation Failed",
        description: "We couldn't verify your membership at this time.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Use cloud data if logged in, otherwise use dummy data
  const displayTasks = user ? (tasks || []) : DUMMY_TASKS;
  const displayShopping = user ? (shopping || []) : DUMMY_ITEMS;
  const displayPersons = user ? (persons || []) : DUMMY_PERSONS;

  const pendingTasksCount = displayTasks.filter((t: any) => !t.isCompleted).length;
  const shoppingItemsCount = displayShopping.length;
  const personCount = displayPersons.length;

  const taskCompletionRate = displayTasks.length > 0 
    ? Math.round(((displayTasks.length - pendingTasksCount) / displayTasks.length) * 100) 
    : 0;

  const widgets = [
    { title: t("nav.tasks"), description: tasksLoading && user ? "..." : `${pendingTasksCount} tasks pending`, icon: CheckSquare, color: "text-primary", href: "/tasks" },
    { title: t("nav.shopping"), description: shoppingLoading && user ? "..." : `${shoppingItemsCount} items on list`, icon: ShoppingBag, color: "text-accent", href: "/shopping" },
    { title: t("nav.calendar"), description: "Family schedule", icon: Calendar, color: "text-orange-500", href: "/calendar" },
    { title: t("nav.tree"), description: personsLoading && user ? "..." : `${personCount} family members`, icon: GitBranch, color: "text-teal-600", href: "/family-tree" },
    { title: t("nav.moments"), description: "Milestones", icon: Clock, color: "text-pink-500", href: "/moments" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            {t("dashboard.greeting", { name: user?.displayName || "Family" })}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("dashboard.description")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <Link key={widget.href} href={widget.href}>
            <Card className="hover:shadow-xl transition-all border-muted/50 hover:border-primary/50 group bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {widget.title}
                </CardTitle>
                <widget.icon className={`h-5 w-5 ${widget.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold group-hover:text-primary transition-colors">{widget.description}</div>
                <div className="mt-3 flex items-center text-xs font-semibold text-muted-foreground group-hover:text-primary">
                  Manage Collection
                  <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-muted/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-6 w-6 text-accent" />
              Family Insights
            </CardTitle>
            <CardDescription>Real-time collaboration activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Household Task Completion</span>
                <span className="text-primary">{taskCompletionRate}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-secondary shadow-inner">
                <div 
                  className="h-3 rounded-full bg-primary transition-all duration-1000 ease-out shadow-sm" 
                  style={{ width: `${taskCompletionRate}%` }} 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-dashed">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                Database Overview
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-bold">ACTIVE USERS</p>
                  <p className="text-lg font-bold">{user ? "1 (Admin)" : "Guest Mode"}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground font-bold">RECORDS</p>
                  <p className="text-lg font-bold">
                    {displayTasks.length + displayShopping.length + displayPersons.length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {moonData && (
          <Card className="shadow-lg relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/10 dark:to-purple-950/10 border-primary/20">
            <div className="absolute -top-4 -right-4 p-6 opacity-10">
              <Moon className="h-40 w-40 text-indigo-500" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-indigo-600 dark:text-indigo-400">
                <Moon className="h-6 w-6" />
                {t("lunar.currentPhase")}
              </CardTitle>
              <CardDescription className="font-medium">For today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-8 py-4">
              <div className="text-8xl drop-shadow-2xl animate-pulse">{moonData.emoji}</div>
              <div className="space-y-2">
                <h3 className="text-3xl font-extrabold tracking-tight">{moonData.name}</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                    Illumination: {Math.round((1 - Math.abs(0.5 - moonData.phase) * 2) * 100)}%
                  </p>
                  <p className="text-xs text-indigo-500 font-semibold italic">Auspicious window is open</p>
                </div>
                <Link href="/calendar">
                  <Badge className="mt-4 hover:bg-primary transition-colors cursor-pointer px-4 py-1">
                    See Monthly View &rarr;
                  </Badge>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invitation Dialog */}
      <Dialog open={!!invitation} onOpenChange={() => setInvitation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              Family Invitation
            </DialogTitle>
            <DialogDescription className="text-lg pt-2">
              <span className="font-bold text-foreground">{invitation?.name}</span>, you have been added to a digital family tree!
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/20 p-6 rounded-2xl border border-dashed border-primary/20 my-4 text-center">
            <p className="text-muted-foreground leading-relaxed italic">
              "Every family story deserves to be preserved. By confirming, you'll be part of the shared heritage and collaboration hub."
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setInvitation(null)}>
              Maybe Later
            </Button>
            <Button className="w-full sm:w-auto gap-2 font-bold px-8" onClick={handleConfirmInvitation} disabled={isConfirming}>
              {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isConfirming ? "Confirming..." : "Confirm & Join"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}