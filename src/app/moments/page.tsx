"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Heart, 
  Calendar, 
  Clock, 
  Car, 
  Trash2, 
  Plus,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

const DUMMY_MOMENTS = [
  { id: "d1", title: "Summer Road Trip", date: "2024-07-15", category: "milestone", description: "First family trip to the mountains" },
  { id: "d2", title: "Car Service", date: "2024-05-10", category: "maintenance", description: "Oil and filters changed" },
  { id: "d3", title: "Hawaii Vacation", date: "2025-01-20", category: "countdown", description: "Can't wait for the beach!" },
];

export default function MomentsPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMoment, setNewMoment] = useState({ title: "", date: "", category: "milestone", description: "" });

  const householdId = user?.uid || "placeholder";

  const momentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "moments");
  }, [firestore, user, householdId]);

  const { data: cloudMoments, isLoading } = useCollection(momentsQuery);

  const displayMoments = user ? cloudMoments : DUMMY_MOMENTS;

  const handleAddMoment = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Sign in to preserve your family's precious moments." });
      return;
    }
    if (!newMoment.title || !newMoment.date) return;

    const momentData = {
      householdId,
      title: newMoment.title,
      date: newMoment.date,
      category: newMoment.category,
      description: newMoment.description,
      createdAt: serverTimestamp(),
      createdByUserId: user.uid,
      householdMembers: { [user.uid]: "admin" }
    };

    const momentsRef = collection(firestore, "households", householdId, "moments");
    addDocumentNonBlocking(momentsRef, momentData);
    setNewMoment({ title: "", date: "", category: "milestone", description: "" });
    setIsAddOpen(false);
  };

  const deleteMoment = (momentId: string) => {
    if (!user || momentId.startsWith("d")) return;
    const momentRef = doc(firestore, "households", householdId, "moments", momentId);
    deleteDocumentNonBlocking(momentRef);
  };

  const getDaysUntil = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "milestone": return <Heart className="h-4 w-4 text-pink-500" />;
      case "maintenance": return <Car className="h-4 w-4 text-primary" />;
      case "countdown": return <Clock className="h-4 w-4 text-accent" />;
      default: return <Camera className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Camera className="h-8 w-8" />
            {t("moments.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            Capture and track your family's most important milestones.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              {t("moments.addMoment")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("moments.addMoment")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={newMoment.title} 
                  onChange={(e) => setNewMoment({ ...newMoment, title: e.target.value })} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={newMoment.date} 
                  onChange={(e) => setNewMoment({ ...newMoment, date: e.target.value })} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newMoment.category}
                  onChange={(e) => setNewMoment({ ...newMoment, category: e.target.value })}
                >
                  <option value="milestone">Milestone / Anniversary</option>
                  <option value="maintenance">Maintenance / Chores</option>
                  <option value="countdown">Countdown / Vacation</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMoment}>{t("common.add")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!user && (
        <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-2xl text-center text-sm font-bold text-pink-700">
          Showing guest moments. Sign in to start your family's digital memory book.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayMoments?.map((moment: any) => {
            const daysLeft = getDaysUntil(moment.date);
            const isPast = daysLeft < 0;

            return (
              <Card key={moment.id} className="group hover:shadow-md transition-all border-muted/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="gap-1.5 px-2">
                      {getCategoryIcon(moment.category)}
                      <span className="capitalize">{moment.category}</span>
                    </Badge>
                    {user && !moment.id.startsWith("d") && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteMoment(moment.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-3">{moment.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {moment.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {moment.category === "countdown" && !isPast && (
                    <div className="mt-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <span className="text-3xl font-bold text-primary">{daysLeft}</span>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                            {t("moments.daysUntil")}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary/30" />
                        <div className="flex-1 text-center">
                          <Sparkles className="h-8 w-8 text-accent mx-auto mb-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {moment.category === "maintenance" && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {t("moments.lastOilChange")}: <span className="font-semibold text-foreground">{moment.date}</span>
                      </p>
                    </div>
                  )}

                  {moment.category === "milestone" && (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      "{moment.description || "A beautiful memory captured in time."}"
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {displayMoments?.length === 0 && (
            <div className="col-span-full py-24 text-center text-muted-foreground">
              No moments captured yet. Start by adding your first family milestone!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
