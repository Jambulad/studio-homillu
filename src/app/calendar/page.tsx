"use client"

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, isSameDay, addHours, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Download, Plus, Clock, MapPin, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

const DUMMY_EVENTS = [
  { id: "d1", title: "Family Picnic", location: "Central Park", description: "Bring sandwiches and fruit", startDateTime: startOfToday() },
  { id: "d2", title: "Doctor Appointment", location: "City Hospital", description: "Routine checkup", startDateTime: addHours(startOfToday(), 4) },
];

export default function CalendarPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", location: "", description: "" });

  const householdId = user?.uid || "placeholder";

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "calendarEvents");
  }, [firestore, user, householdId]);

  const { data: cloudEvents, isLoading } = useCollection(eventsQuery);

  const displayEvents = user ? cloudEvents : DUMMY_EVENTS;

  const selectedDayEvents = useMemo(() => {
    if (!date || !displayEvents) return [];
    return displayEvents.filter((event: any) => {
      const eventDate = event.startDateTime?.toDate ? event.startDateTime.toDate() : new Date(event.startDateTime);
      return isSameDay(eventDate, date);
    });
  }, [date, displayEvents]);

  const handleAddEvent = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to schedule family events." });
      return;
    }
    if (!newEvent.title || !date) return;

    const eventData = {
      householdId,
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      startDateTime: date,
      isAllDay: false,
      createdAt: serverTimestamp(),
      createdByUserId: user.uid,
      householdMembers: { [user.uid]: "admin" }
    };

    const eventsRef = collection(firestore, "households", householdId, "calendarEvents");
    addDocumentNonBlocking(eventsRef, eventData);
    setNewEvent({ title: "", location: "", description: "" });
    setIsAddOpen(false);
  };

  const deleteEvent = (eventId: string) => {
    if (!user || eventId.startsWith("d")) return;
    const eventRef = doc(firestore, "households", householdId, "calendarEvents", eventId);
    deleteDocumentNonBlocking(eventRef);
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

      <div className="grid gap-6 md:grid-cols-[400px_1fr]">
        <Card className="shadow-sm border-muted/50 overflow-hidden">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-none border-none"
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {date ? format(date, "PPPP") : t("calendar.events")}
            </CardTitle>
            <CardDescription>
              {selectedDayEvents.length} {t("calendar.events").toLowerCase()} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayEvents.map((event: any) => {
                      const eventDate = event.startDateTime?.toDate ? event.startDateTime.toDate() : new Date(event.startDateTime);
                      return (
                        <div 
                          key={event.id} 
                          className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group relative overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{event.title}</h4>
                              <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  {format(eventDate, "p")}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            {user && !event.id.startsWith("d") && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteEvent(event.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {event.description && (
                            <p className="mt-3 text-sm text-muted-foreground border-t pt-2 border-dashed">
                              {event.description}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-4">
                    <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                      <CalendarIcon className="h-8 w-8 opacity-20" />
                    </div>
                    <p>{t("calendar.noEvents")}</p>
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
