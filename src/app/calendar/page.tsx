
"use client"

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, isSameDay, addHours, startOfToday, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subMonths, addMonths, setYear, parseISO, isValid } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, 
  Download, 
  Plus, 
  Clock, 
  MapPin, 
  Loader2, 
  Trash2, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Sparkles,
  Zap,
  Star,
  Compass,
  Cake
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { getMoonPhase, getTithi, getNakshatra, getRaasi, getRahukalam } from "@/lib/lunar-utils";
import { cn } from "@/lib/utils";

const DUMMY_EVENTS = [
  { id: "d1", title: "Family Picnic", location: "Central Park", description: "Bring sandwiches and fruit", startDateTime: startOfToday() },
  { id: "d2", title: "Doctor Appointment", location: "City Hospital", description: "Routine checkup", startDateTime: addHours(startOfToday(), 4) },
];

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", location: "", description: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const householdId = user?.uid || "placeholder";

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "calendarEvents");
  }, [firestore, user, householdId]);

  const personsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "persons");
  }, [firestore, user, householdId]);

  const { data: cloudEvents, isLoading } = useCollection(eventsQuery);
  const { data: cloudPersons } = useCollection(personsQuery);

  const birthdays = useMemo(() => {
    if (!cloudPersons) return [];
    return cloudPersons
      .filter(p => p.birthDate)
      .map(p => {
        const bdayStr = p.birthDate;
        let date: Date | null = null;
        
        // Try to parse common formats
        if (bdayStr.length === 4) { // Only year
          date = null;
        } else {
          const parsed = new Date(bdayStr);
          if (isValid(parsed)) date = parsed;
        }

        if (!date) return null;

        return {
          id: `bday-${p.id}`,
          title: `${p.name}'s Birthday`,
          isBirthday: true,
          originalDate: date,
          location: "Family Hub",
          description: `Celebrating ${p.name}'s special day!`,
        };
      })
      .filter((b): b is any => b !== null);
  }, [cloudPersons]);

  const displayEvents = useMemo(() => {
    const base = user ? (cloudEvents || []) : DUMMY_EVENTS;
    
    // Create virtual instances of birthdays for the visible range (current month)
    const currentMonthBirthdays = birthdays.map(b => {
      const bdayThisYear = setYear(b.originalDate, currentViewDate.getFullYear());
      return { ...b, startDateTime: bdayThisYear };
    });

    return [...base, ...currentMonthBirthdays];
  }, [user, cloudEvents, birthdays, currentViewDate]);

  const currentMonthStart = startOfMonth(currentViewDate);
  const currentMonthEnd = endOfMonth(currentViewDate);
  const daysInMonth = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });

  const selectedDayEvents = useMemo(() => {
    if (!displayEvents) return [];
    return displayEvents.filter((event: any) => {
      const eventDate = event.startDateTime?.toDate ? event.startDateTime.toDate() : new Date(event.startDateTime);
      return isSameDay(eventDate, selectedDate);
    });
  }, [selectedDate, displayEvents]);

  const moonInfo = getMoonPhase(selectedDate);
  const tithi = getTithi(selectedDate, i18n.language as "en" | "te");
  const nakshatra = getNakshatra(selectedDate, i18n.language as "en" | "te");
  const raasi = getRaasi(selectedDate, i18n.language as "en" | "te");
  const rahukalam = getRahukalam(selectedDate);

  const handleAddEvent = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to schedule family events." });
      return;
    }
    if (!newEvent.title) return;

    const eventData = {
      householdId,
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      startDateTime: selectedDate,
      isAllDay: false,
      createdAt: serverTimestamp(),
      createdByUserId: user.uid,
      householdMembers: { [user.uid]: "admin" }
    };

    const eventsRef = collection(firestore, "households", householdId, "calendarEvents");
    addDocumentNonBlocking(eventsRef, eventData);
    setNewEvent({ title: "", location: "", description: "" });
    setIsAddOpen(false);
    toast({ title: "Event scheduled" });
  };

  const deleteEvent = (eventId: string) => {
    if (!user || eventId.startsWith("d") || eventId.startsWith("bday")) return;
    const eventRef = doc(firestore, "households", householdId, "calendarEvents", eventId);
    deleteDocumentNonBlocking(eventRef);
    toast({ title: "Event removed" });
  };

  const exportToICS = () => {
    if (!displayEvents) return;
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//HomIllu//Family Calendar//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
    
    displayEvents.forEach((event: any) => {
      const eventDate = event.startDateTime?.toDate ? event.startDateTime.toDate() : new Date(event.startDateTime);
      const dtStart = format(eventDate, "yyyyMMdd'T'HHmmss'Z'");
      const dtEnd = format(addHours(eventDate, 1), "yyyyMMdd'T'HHmmss'Z'");
      const dtStamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${event.id}@homillu.com\n`;
      icsContent += `DTSTAMP:${dtStamp}\n`;
      icsContent += `DTSTART:${dtStart}\n`;
      icsContent += `DTEND:${dtEnd}\n`;
      icsContent += `SUMMARY:${event.title}\n`;
      if (event.description) icsContent += `DESCRIPTION:${event.description}\n`;
      if (event.location) icsContent += `LOCATION:${event.location}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "homillu-family-calendar.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <CalendarIcon className="h-8 w-8" />
            {t("calendar.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("calendar.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportToICS}>
            <Download className="h-4 w-4" />
            {t("calendar.export")}
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg">
                <Plus className="h-4 w-4" />
                {t("calendar.newEvent")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("calendar.newEvent")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">{t("calendar.eventTitle")}</Label>
                  <Input 
                    id="title" 
                    value={newEvent.title} 
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} 
                    placeholder="e.g. Family Dinner"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={newEvent.location} 
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} 
                    placeholder="Optional"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    value={newEvent.description} 
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} 
                    placeholder="Optional"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEvent}>{t("common.add")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!user && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl text-center text-sm font-semibold text-orange-700">
          Showing sample calendar events. Log in to manage your family's personal schedule.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Calendar Grid */}
        <Card className="shadow-sm border-muted/50 overflow-hidden">
          <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {format(currentViewDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentViewDate(subMonths(currentViewDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentViewDate(addMonths(currentViewDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-xs font-bold text-muted-foreground pb-2 uppercase tracking-widest">{d}</div>
              ))}
              {Array.from({ length: currentMonthStart.getDay() }).map((_, i) => (
                <div key={`fill-${i}`} className="aspect-square opacity-20" />
              ))}
              {daysInMonth.map(date => {
                const phase = getMoonPhase(date);
                const isToday = isSameDay(date, new Date());
                const isSelected = isSameDay(date, selectedDate);
                const dayEvents = displayEvents?.filter((e: any) => {
                  const ed = e.startDateTime?.toDate ? e.startDateTime.toDate() : new Date(e.startDateTime);
                  return isSameDay(ed, date);
                });
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-between p-2 rounded-xl transition-all border group relative",
                      isSelected ? "bg-primary text-primary-foreground border-primary shadow-lg z-10 scale-105" : 
                      isToday ? "border-accent bg-accent/5" : "hover:border-primary/40 bg-card"
                    )}
                  >
                    <div className="flex justify-between w-full items-start">
                      <span className="text-xs font-bold">{format(date, "d")}</span>
                      {dayEvents && dayEvents.length > 0 && (
                        <div className="flex gap-0.5">
                          {dayEvents.slice(0, 3).map((e, i) => (
                            <div key={i} className={cn("h-1.5 w-1.5 rounded-full", isSelected ? "bg-white" : e.isBirthday ? "bg-pink-500" : "bg-primary")} />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xl leading-none group-hover:scale-125 transition-transform">
                      {phase.emoji}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Lunar Phase Card */}
          <Card className="shadow-lg border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 p-6 opacity-10">
              <Moon className="h-24 w-24 text-indigo-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {t("lunar.currentPhase")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <div className="text-6xl mb-4 drop-shadow-xl animate-in zoom-in duration-500">{moonInfo.emoji}</div>
              <h3 className="text-xl font-bold">{moonInfo.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{tithi}</p>
              
              <div className="w-full mt-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>{t("lunar.visibility")}</span>
                  <span>{Math.round((1 - Math.abs(0.5 - moonInfo.phase) * 2) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000" 
                    style={{ width: `${(1 - Math.abs(0.5 - moonInfo.phase) * 2) * 100}%` }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events for Selected Day */}
          <Card className="shadow-sm border-muted/50">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {format(selectedDate, "PPPP")}
              </CardTitle>
              <CardDescription>
                {selectedDayEvents.length} {t("calendar.events").toLowerCase()} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  {selectedDayEvents.length > 0 ? (
                    <div className="p-4 space-y-4">
                      {selectedDayEvents.map((event: any) => {
                        const eventDate = event.startDateTime?.toDate ? event.startDateTime.toDate() : new Date(event.startDateTime);
                        return (
                          <div 
                            key={event.id} 
                            className={cn(
                              "p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group relative overflow-hidden",
                              event.isBirthday && "border-pink-500/30 bg-pink-50/10 dark:bg-pink-900/10"
                            )}
                          >
                            <div className={cn(
                              "absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors",
                              event.isBirthday && "bg-pink-500"
                            )} />
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={cn(
                                  "font-bold text-md leading-tight group-hover:text-primary transition-colors flex items-center gap-2",
                                  event.isBirthday && "text-pink-600 dark:text-pink-400"
                                )}>
                                  {event.isBirthday && <Cake className="h-4 w-4" />}
                                  {event.title}
                                </h4>
                                <div className="flex flex-col gap-1 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                  {!event.isBirthday && (
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3" />
                                      {format(eventDate, "p")}
                                    </span>
                                  )}
                                  {event.location && (
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="h-3 w-3" />
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {user && !event.id.startsWith("d") && !event.isBirthday && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteEvent(event.id)}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                            {event.description && (
                              <p className="mt-3 text-xs text-muted-foreground border-t pt-2 border-dashed italic">
                                "{event.description}"
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-4 opacity-50">
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                        <CalendarIcon className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">{t("calendar.noEvents")}</p>
                    </div>
                  )}
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Traditional Context Card */}
          <Card className="border-muted/50 shadow-sm">
            <CardHeader className="pb-2 bg-accent/5">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-accent">
                <Info className="h-4 w-4" />
                {t("calendar.traditionalContext")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-4 text-xs font-medium">
              <div className="flex justify-between items-center border-b pb-2 border-dashed">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Moon className="h-3 w-3" /> {t("calendar.tithi")}
                </span>
                <span className="font-bold text-primary">{tithi}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2 border-dashed">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Star className="h-3 w-3" /> {t("calendar.nakshatra")}
                </span>
                <span className="font-bold text-primary">{nakshatra}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2 border-dashed">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Compass className="h-3 w-3" /> {t("calendar.raasi")}
                </span>
                <span className="font-bold text-primary">{raasi}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2 border-dashed">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3 w-3" /> {t("calendar.rahukalam")}
                </span>
                <span className="font-bold text-destructive">{rahukalam}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> {t("calendar.auspicious")}
                </span>
                <span className="font-bold text-green-600">
                  {t("calendar.open")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
