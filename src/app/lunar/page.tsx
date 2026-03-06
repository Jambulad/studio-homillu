"use client"

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Moon, Calendar as CalendarIcon, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMoonPhase, getTithi } from "@/lib/lunar-utils";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

export default function LunarCalendarPage() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
  
  const moonInfo = getMoonPhase(currentDate);
  const tithi = getTithi(currentDate);

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Moon className="h-8 w-8" />
            {t("lunar.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("lunar.description")}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-bold px-4">{format(currentDate, "MMMM yyyy")}</span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_350px]">
        <Card className="shadow-sm border-muted/50 overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Monthly View
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-xs font-bold text-muted-foreground pb-2">{d}</div>
              ))}
              {/* Fillers for start of month */}
              {Array.from({ length: currentMonthStart.getDay() }).map((_, i) => (
                <div key={`fill-${i}`} />
              ))}
              {daysInMonth.map(date => {
                const phase = getMoonPhase(date);
                const isToday = isSameDay(date, new Date());
                const isSelected = isSameDay(date, currentDate);
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setCurrentDate(date)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-xl transition-all border group",
                      isSelected ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105 z-10" : 
                      isToday ? "border-accent bg-accent/5" : "hover:border-primary/40 bg-card"
                    )}
                  >
                    <span className="text-xs font-bold">{format(date, "d")}</span>
                    <span className="text-lg leading-none mt-1 group-hover:scale-125 transition-transform">
                      {phase.emoji}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Moon className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {t("lunar.currentPhase")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <div className="text-7xl mb-4 drop-shadow-xl">{moonInfo.emoji}</div>
              <h3 className="text-2xl font-bold text-primary">{moonInfo.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{tithi}</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{t("lunar.visibility")}</span>
                  <span className="font-bold">{Math.round((1 - Math.abs(0.5 - moonInfo.phase) * 2) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(1 - Math.abs(0.5 - moonInfo.phase) * 2) * 100}%` }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <Info className="h-4 w-4 text-accent" />
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b pb-2 border-dashed">
                <span className="text-muted-foreground">Auspicious?</span>
                <span className="font-bold text-green-600">Likely</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2 border-dashed">
                <span className="text-muted-foreground">Cycle Progress</span>
                <span className="font-bold">{Math.round(moonInfo.phase * 100)}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">Selected Date:</span>
                <span className="font-bold">{format(currentDate, "PPP")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
