
"use client"

import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  CheckSquare, 
  ShoppingBag, 
  Calendar, 
  GitBranch, 
  Clock, 
  Zap,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const widgets = [
    { title: t("nav.tasks"), description: "4 tasks pending for today", icon: CheckSquare, color: "text-primary", href: "/tasks" },
    { title: t("nav.shopping"), description: "7 items on list", icon: ShoppingBag, color: "text-accent", href: "/shopping" },
    { title: t("nav.calendar"), description: "Family lunch at 1 PM", icon: Calendar, color: "text-orange-500", href: "/calendar" },
    { title: t("nav.tree"), description: "5 generations explored", icon: GitBranch, color: "text-teal-600", href: "/family-tree" },
    { title: t("nav.moments"), description: "2 days to Anniversary", icon: Clock, color: "text-pink-500", href: "/moments" },
    { title: t("nav.utilities"), description: "Electricity bill due in 3 days", icon: Zap, color: "text-yellow-500", href: "/utilities" },
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
            <CardDescription>How you're doing this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Task Completion Rate</span>
                <span className="font-bold">85%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[85%] rounded-full bg-accent" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Budget Utilization</span>
                <span className="font-bold">62%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div className="h-2 w-[62%] rounded-full bg-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Memories</CardTitle>
            <CardDescription>Moments from last weekend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <img src="https://picsum.photos/seed/mem1/300/200" alt="Memory 1" className="rounded-md object-cover w-full h-24 shadow-sm" />
              <img src="https://picsum.photos/seed/mem2/300/200" alt="Memory 2" className="rounded-md object-cover w-full h-24 shadow-sm" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
