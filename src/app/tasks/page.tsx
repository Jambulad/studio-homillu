
"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock, User, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  assignee: string;
  recurrence: string;
  isDone: boolean;
}

export default function TasksPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Water the plants", assignee: "Aryan", recurrence: "Daily", isDone: false },
    { id: "2", title: "Grocery shopping", assignee: "Anjali", recurrence: "Weekly", isDone: true },
    { id: "3", title: "Clean the garage", assignee: "Srinivas", recurrence: "Monthly", isDone: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t));
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
        <Button className="gap-2 shadow-lg">
          <Plus className="h-4 w-4" />
          {t("tasks.add")}
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`group border-l-4 transition-all ${task.isDone ? 'border-l-accent bg-accent/5 opacity-75' : 'border-l-primary shadow-sm hover:shadow-md'}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Checkbox 
                  checked={task.isDone} 
                  onCheckedChange={() => toggleTask(task.id)} 
                  className="h-6 w-6"
                />
                <div>
                  <h3 className={`font-semibold text-lg ${task.isDone ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {task.assignee}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {task.recurrence}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={task.isDone ? "outline" : "default"}>
                  {task.isDone ? t("tasks.done") : "Pending"}
                </Badge>
                <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
