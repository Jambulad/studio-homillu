
"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock, User, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TasksPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee: "", recurrence: "none" });

  const householdId = user?.uid || "default";

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "tasks");
  }, [firestore, user, householdId]);

  const { data: tasks, isLoading } = useCollection(tasksQuery);

  const handleAddTask = () => {
    if (!newTask.title || !user) return;

    const taskData = {
      householdId,
      title: newTask.title,
      description: "",
      assignedToId: newTask.assignee || user.uid,
      isCompleted: false,
      recurrence: newTask.recurrence,
      createdAt: serverTimestamp(),
      createdByUserId: user.uid,
      householdMembers: { [user.uid]: "admin" }
    };

    const tasksRef = collection(firestore, "households", householdId, "tasks");
    addDocumentNonBlocking(tasksRef, taskData);
    setNewTask({ title: "", assignee: "", recurrence: "none" });
    setIsAddOpen(false);
  };

  const toggleTask = (taskId: string, currentStatus: boolean) => {
    if (!firestore) return;
    const taskRef = doc(firestore, "households", householdId, "tasks", taskId);
    updateDocumentNonBlocking(taskRef, { 
      isCompleted: !currentStatus,
      completedAt: !currentStatus ? serverTimestamp() : null
    });
  };

  const deleteTask = (taskId: string) => {
    if (!firestore) return;
    const taskRef = doc(firestore, "households", householdId, "tasks", taskId);
    deleteDocumentNonBlocking(taskRef);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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
              <DialogTitle>{t("tasks.add")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input 
                  id="title" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assign To (Name)</Label>
                <Input 
                  id="assignee" 
                  value={newTask.assignee} 
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask}>{t("common.add")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks?.length === 0 && (
            <p className="text-center text-muted-foreground py-12">{t("tasks.noTasks")}</p>
          )}
          {tasks?.map((task: any) => (
            <Card key={task.id} className={`group border-l-4 transition-all ${task.isCompleted ? 'border-l-accent bg-accent/5 opacity-75' : 'border-l-primary shadow-sm hover:shadow-md'}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Checkbox 
                    checked={task.isCompleted} 
                    onCheckedChange={() => toggleTask(task.id, task.isCompleted)} 
                    className="h-6 w-6"
                  />
                  <div>
                    <h3 className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {task.assignedToId === user?.uid ? "Me" : task.assignedToId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {task.recurrence || "None"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.isCompleted ? "outline" : "default"}>
                    {task.isCompleted ? t("tasks.done") : "Pending"}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteTask(task.id)}
                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
