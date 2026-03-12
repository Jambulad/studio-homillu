
"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock, User, Trash2, Loader2, Sparkles, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sendTaskNotification } from "@/ai/flows/send-task-notification";

const DUMMY_TASKS = [
  { id: "d1", title: "Water the indoor plants", assignedToId: "Jambula Chandraiah", recurrence: "Daily", isCompleted: false },
  { id: "d2", title: "Buy groceries for dinner", assignedToId: "Me", recurrence: "None", isCompleted: true },
  { id: "d3", title: "Clean the backyard", assignedToId: "Jambula Latha", recurrence: "Weekly", isCompleted: false },
];

const DUMMY_PERSONS = [
  { id: "p1", name: "Jambula Chandraiah" },
  { id: "p2", name: "Jambula Laxmamma" },
  { id: "p3", name: "Jambula Sreerama Murthy" },
  { id: "p4", name: "Jambula Latha" },
];

export default function TasksPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee: "", recurrence: "none" });

  const householdId = user?.uid || "placeholder";

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "tasks");
  }, [firestore, user, householdId]);

  const personsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "persons");
  }, [firestore, user, householdId]);

  const { data: cloudTasks, isLoading: tasksLoading } = useCollection(tasksQuery);
  const { data: cloudPersons, isLoading: personsLoading } = useCollection(personsQuery);

  const displayTasks = user ? cloudTasks : DUMMY_TASKS;
  const displayPersons = user ? cloudPersons : DUMMY_PERSONS;

  const handleAddTask = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save your family tasks." });
      return;
    }
    if (!newTask.title) return;

    const taskData = {
      householdId,
      title: newTask.title,
      description: "",
      assignedToId: newTask.assignee || user.displayName || "Me",
      isCompleted: false,
      recurrence: newTask.recurrence,
      createdAt: serverTimestamp(),
      createdByUserId: user.uid,
      householdMembers: { [user.uid]: "admin" }
    };

    const tasksRef = collection(firestore, "households", householdId, "tasks");
    addDocumentNonBlocking(tasksRef, taskData);

    // Trigger AI Notification Flow
    if (newTask.assignee && newTask.assignee !== "Me" && newTask.assignee !== "Myself") {
      setIsNotifying(true);
      try {
        const result = await sendTaskNotification({
          taskTitle: newTask.title,
          assigneeName: newTask.assignee,
          assignedBy: user.displayName || "A Family Member"
        });
        
        toast({
          title: "AI Notification Prepared",
          description: result.preview,
        });
      } catch (err) {
        console.error("Notification Error:", err);
        toast({
          variant: "destructive",
          title: "Notification failed",
          description: "Could not generate AI notification."
        });
      } finally {
        setIsNotifying(false);
      }
    } else {
      toast({ title: "Task added" });
    }

    setNewTask({ title: "", assignee: "", recurrence: "none" });
    setIsAddOpen(false);
  };

  const toggleTask = (taskId: string, currentStatus: boolean) => {
    if (!user || taskId.startsWith("d")) {
      toast({ title: "Preview Mode", description: "Sign in to interact with tasks." });
      return;
    }
    const taskRef = doc(firestore, "households", householdId, "tasks", taskId);
    updateDocumentNonBlocking(taskRef, { 
      isCompleted: !currentStatus,
      completedAt: !currentStatus ? serverTimestamp() : null
    });
  };

  const deleteTask = (taskId: string) => {
    if (!user || taskId.startsWith("d")) return;
    const taskRef = doc(firestore, "households", householdId, "tasks", taskId);
    deleteDocumentNonBlocking(taskRef);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <CheckSquare className="h-8 w-8" />
            {t("tasks.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("tasks.description")}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              {t("tasks.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                {t("tasks.add")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Title</Label>
                <Input 
                  id="title" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
                  placeholder="e.g. Wash the car"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign To Family Member</Label>
                <Select value={newTask.assignee} onValueChange={(val) => setNewTask({ ...newTask, assignee: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member from your tree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Me">Myself</SelectItem>
                    {displayPersons?.map((person: any) => (
                      <SelectItem key={person.id} value={person.name}>
                        {person.name}
                      </SelectItem>
                    ))}
                    {!displayPersons?.length && (
                      <div className="p-2 text-xs text-muted-foreground italic">
                        Add people in Family Tree to see them here.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI will send an encouraging notification to the assignee.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask} disabled={isNotifying} className="gap-2 font-bold min-w-[120px]">
                {isNotifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isNotifying ? "Notifying..." : t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tasksLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {!user && (
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl text-sm text-center font-bold text-primary mb-4">
              Showing preview data. Sign in to collaborate with your real family members.
            </div>
          )}
          {displayTasks?.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl">
              <p className="text-muted-foreground">{t("tasks.noTasks")}</p>
            </div>
          )}
          {displayTasks?.map((task: any) => (
            <Card key={task.id} className={`group border-l-4 transition-all hover:shadow-md ${task.isCompleted ? 'border-l-accent bg-accent/5 opacity-75' : 'border-l-primary shadow-sm'}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Checkbox 
                    checked={task.isCompleted} 
                    onCheckedChange={() => toggleTask(task.id, task.isCompleted)} 
                    className="h-6 w-6"
                  />
                  <div>
                    <h3 className={`font-bold text-lg ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-full font-medium">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {task.assignedToId === user?.uid ? "Me" : task.assignedToId}
                      </span>
                      {task.recurrence !== 'none' && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {task.recurrence || "Once"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.isCompleted ? "outline" : "default"} className={task.isCompleted ? "border-accent text-accent" : ""}>
                    {task.isCompleted ? t("tasks.done") : "Pending"}
                  </Badge>
                  {user && !task.id.startsWith("d") && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteTask(task.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
