
"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock, User, Trash2, Loader2, Send, Calendar as CalendarIcon, Pencil, AlertTriangle } from "lucide-react";
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
import { isBefore, parseISO, startOfToday, isValid } from "date-fns";

const DUMMY_TASKS = [
  { id: "d1", title: "Water the indoor plants", assignedToId: "Jambula Chandraiah", recurrence: "Daily", isCompleted: false, dueDate: new Date().toISOString().split('T')[0] },
  { id: "d2", title: "Buy groceries for dinner", assignedToId: "Me", recurrence: "None", isCompleted: true, dueDate: new Date().toISOString().split('T')[0] },
  { id: "d3", title: "Clean the backyard", assignedToId: "Jambula Latha", recurrence: "Weekly", isCompleted: false, dueDate: new Date().toISOString().split('T')[0] },
];

export default function TasksPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isNotifying, setIsNotifying] = useState(false);
  
  const initialTaskState = { title: "", assignee: "", recurrence: "none", dueDate: "" };
  const [taskForm, setTaskForm] = useState(initialTaskState);

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
  const { data: cloudPersons } = useCollection(personsQuery);

  const displayTasks = user ? cloudTasks : DUMMY_TASKS;
  const displayPersons = user ? (cloudPersons || []) : [];

  const handleSaveTask = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to manage your family tasks." });
      return;
    }
    if (!taskForm.title) return;

    const selectedPerson = displayPersons.find(p => p.id === taskForm.assignee);
    const assignedName = selectedPerson ? selectedPerson.name : (taskForm.assignee === "Me" ? (user.displayName || "Me") : taskForm.assignee);
    const assignedEmail = selectedPerson?.email || "";

    const taskData: any = {
      householdId,
      title: taskForm.title,
      assignedToId: taskForm.assignee || user.uid || "Me",
      assignedToName: assignedName,
      assignedToEmail: assignedEmail,
      recurrence: taskForm.recurrence,
      dueDate: taskForm.dueDate || null,
      updatedAt: serverTimestamp(),
      householdMembers: { [user.uid]: "admin" }
    };

    try {
      if (isEditMode && editingTaskId) {
        const taskRef = doc(firestore, "households", householdId, "tasks", editingTaskId);
        updateDocumentNonBlocking(taskRef, taskData);
        toast({ title: "Task updated" });
      } else {
        const tasksRef = collection(firestore, "households", householdId, "tasks");
        addDocumentNonBlocking(tasksRef, {
          ...taskData,
          isCompleted: false,
          createdAt: serverTimestamp(),
          createdByUserId: user.uid,
        });

        // Notify if assigned to someone else
        if (taskForm.assignee && taskForm.assignee !== "Me" && taskForm.assignee !== user.uid) {
          setIsNotifying(true);
          try {
            await sendTaskNotification({
              taskTitle: taskForm.title,
              assigneeName: assignedName,
              assignedBy: user.displayName || "A Family Member",
              email: assignedEmail || undefined
            });
            toast({ title: "Notification Sent", description: `Assigned to ${assignedName}.` });
          } catch (err) {
            console.error("Notification Error:", err);
          } finally {
            setIsNotifying(false);
          }
        } else {
          toast({ title: "Task added" });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTaskForm(initialTaskState);
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingTaskId(null);
    }
  };

  const handleEditClick = (task: any) => {
    setTaskForm({
      title: task.title,
      assignee: task.assignedToId,
      recurrence: task.recurrence || "none",
      dueDate: task.dueDate || ""
    });
    setEditingTaskId(task.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
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
    toast({ title: "Task deleted" });
  };

  const openAddDialog = () => {
    setTaskForm(initialTaskState);
    setIsEditMode(false);
    setEditingTaskId(null);
    setIsDialogOpen(true);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              {t("tasks.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                {isEditMode ? "Edit Task" : t("tasks.add")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Title</Label>
                <Input 
                  id="title" 
                  value={taskForm.title} 
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} 
                  placeholder="e.g. Wash the car"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={taskForm.dueDate} 
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} 
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assign To Family Member</Label>
                <Select value={taskForm.assignee} onValueChange={(val) => setTaskForm({ ...taskForm, assignee: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member from your tree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Me">Myself</SelectItem>
                    {displayPersons.map((person: any) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recurrence</Label>
                <Select value={taskForm.recurrence} onValueChange={(val) => setTaskForm({ ...taskForm, recurrence: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveTask} disabled={isNotifying} className="gap-2 font-bold min-w-[120px]">
                {isNotifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isNotifying ? "Processing..." : (isEditMode ? "Update Task" : t("common.add"))}
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
          {displayTasks?.map((task: any) => {
            const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
            const isExpired = dueDate && isValid(dueDate) && !task.isCompleted && isBefore(dueDate, startOfToday());

            return (
              <Card key={task.id} className={`group border-l-4 transition-all hover:shadow-md ${task.isCompleted ? 'border-l-accent bg-accent/5 opacity-75' : isExpired ? 'border-l-destructive shadow-sm' : 'border-l-primary shadow-sm'}`}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      checked={task.isCompleted} 
                      onCheckedChange={() => toggleTask(task.id, task.isCompleted)} 
                      className="h-6 w-6"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h3>
                        {isExpired && (
                          <Badge variant="destructive" className="uppercase tracking-tighter font-black text-[10px] h-4">
                            <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                            Expired
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-full font-medium">
                          <User className="h-3.5 w-3.5 text-primary" />
                          {task.assignedToId === user?.uid || task.assignedToId === 'Me' ? "Me" : (task.assignedToName || task.assignedToId)}
                        </span>
                        {task.dueDate && (
                          <span className={`flex items-center gap-1.5 text-xs font-bold ${isExpired ? 'text-destructive' : 'text-orange-600 dark:text-orange-400'}`}>
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Due: {task.dueDate}
                          </span>
                        )}
                        {task.recurrence && task.recurrence !== 'none' && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {task.recurrence}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.isCompleted ? "outline" : isExpired ? "destructive" : "default"} className={task.isCompleted ? "border-accent text-accent" : ""}>
                      {task.isCompleted ? t("tasks.done") : isExpired ? "Overdue" : "Pending"}
                    </Badge>
                    {user && !task.id.startsWith("d") && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditClick(task)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteTask(task.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
