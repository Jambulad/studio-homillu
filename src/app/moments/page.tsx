
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
  Sparkles
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

interface Moment {
  id: string;
  title: string;
  date: string;
  category: "milestone" | "maintenance" | "countdown";
  description?: string;
}

const initialMoments: Moment[] = [
  { id: "1", title: "Wedding Anniversary", date: "2025-06-15", category: "milestone", description: "15th Anniversary celebration" },
  { id: "2", title: "Last Oil Change - Honda City", date: "2024-12-01", category: "maintenance" },
  { id: "3", title: "Summer Vacation", date: "2025-05-10", category: "countdown", description: "Trip to Vizag" },
];

export default function MomentsPage() {
  const { t } = useTranslation();
  const [moments, setMoments] = useState<Moment[]>(initialMoments);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMoment, setNewMoment] = useState<Partial<Moment>>({ title: "", date: "", category: "milestone" });

  const handleAddMoment = () => {
    if (newMoment.title && newMoment.date) {
      const moment: Moment = {
        id: Math.random().toString(36).substr(2, 9),
        title: newMoment.title,
        date: newMoment.date,
        category: newMoment.category as any,
        description: newMoment.description,
      };
      setMoments([moment, ...moments]);
      setNewMoment({ title: "", date: "", category: "milestone" });
      setIsAddOpen(false);
    }
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
                  placeholder="e.g. Grandma's Birthday"
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newMoment.category}
                  onChange={(e) => setNewMoment({ ...newMoment, category: e.target.value as any })}
                >
                  <option value="milestone">Milestone / Anniversary</option>
                  <option value="maintenance">Maintenance / Chores</option>
                  <option value="countdown">Countdown / Vacation</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleAddMoment}>{t("common.add")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {moments.map((moment) => {
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                    <div className="h-1.5 w-full bg-secondary rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary w-3/4 rounded-full" />
                    </div>
                  </div>
                )}

                {moment.category === "milestone" && (
                  <p className="mt-2 text-sm text-muted-foreground italic">
                    "{moment.description || "A beautiful memory captured in time."}"
                  </p>
                )}
                
                {isPast && moment.category !== "maintenance" && (
                  <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-between text-xs text-muted-foreground">
                    <span>Happened {Math.abs(daysLeft)} days ago</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary">View Photos</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
