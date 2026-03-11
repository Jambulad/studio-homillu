
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
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getMoonPhase } from "@/lib/lunar-utils";
import { useState, useEffect } from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const firestore = useFirestore();
  const [moonData, setMoonData] = useState<ReturnType<typeof getMoonPhase> | null>(null);

  useEffect(() => {
    setMoonData(getMoonPhase());
  }, []);

  const householdId = user?.uid || "default";

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "tasks");
  }, [firestore, user, householdId]);

  const shoppingQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "shoppingListItems");
  }, [firestore, user, householdId]);

  const { data: tasks, isLoading: tasksLoading } = useCollection(tasksQuery);
  const { data: shopping, isLoading: shoppingLoading } = useCollection(shoppingQuery);

  const pendingTasks = tasks?.filter((t: any) => !t.isCompleted).length || 0;
  const shoppingItems = shopping?.length || 0;

  const widgets = [
    { 
      title: t("nav.tasks"), 
      description: tasksLoading ? "..." : `${pendingTasks} tasks pending`, 
      icon: CheckSquare, 
      color: "text-primary", 
      href: "/tasks" 
    },
    { 
      title: t("nav.shopping"), 
      description: shoppingLoading ? "..." : `${shoppingItems} items on list`, 
      icon: ShoppingBag, 
      color: "text-accent", 
      href: "/shopping" 
    },
    { 
      title: t("nav.calendar"), 
      description: "Family schedule", 
      icon: Calendar, 
      color: "text-orange-500", 
      href: "/calendar" 
    },
    { 
      title: t("nav.tree"), 
      description: "Generations explored", 
      icon: GitBranch, 
      color: "text-teal-600", 
      href: "/family-tree" 
    },
    { 
      title: t("nav.moments"), 
      description: "Milestones", 
      icon: Clock, 
      color: "text-pink-500", 
      href: "/moments" 
    },
    { 
      title: t("nav.lunar"), 
      description: moonData ? `${moonData.emoji} ${moonData.name}` : "Loading...", 
      icon: Moon, 
      color: "text-indigo-500", 
      href: "/lunar" 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {t("dashboard.greeting", { name: user?.displayName || "Family" })}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.description")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <Link key={widget.href} href={widget.href}>
            <Card className="hover:shadow-lg transition-all border-muted/50 hover:border-primary/50 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {widget.title}
                </CardTitle>
                <widget.icon className={`h-4 w-4 ${widget.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold group-hover:text-primary transition-colors">{widget.description}</div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground group-hover:text-primary">
                  View details
                  <ChevronRight className="ml-1 h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Family Insights
            </CardTitle>
            <CardDescription>Real-time activity stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Task Completion</span>
                <span className="font-bold">
                  {tasks?.length ? Math.round(((tasks.length - pendingTasks) / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div 
                  className="h-2 rounded-full bg-accent transition-all duration-500" 
                  style={{ width: `${tasks?.length ? ((tasks.length - pendingTasks) / tasks.length) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {moonData && (
          <Card className="shadow-sm relative overflow-hidden bg-indigo-50/30 dark:bg-indigo-950/10">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Moon className="h-20 w-20 text-indigo-500" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Moon className="h-5 w-5" />
                {t("lunar.currentPhase")}
              </CardTitle>
              <CardDescription>For today, {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="text-6xl drop-shadow-md">{moonData.emoji}</div>
              <div>
                <h3 className="text-2xl font-bold">{moonData.name}</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">
                  Illumination: {Math.round((1 - Math.abs(0.5 - moonData.phase) * 2) * 100)}%
                </p>
                <Link href="/lunar">
                  <span className="text-xs text-indigo-500 hover:underline mt-2 inline-block font-bold">
                    Explore Lunar Calendar &rarr;
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
