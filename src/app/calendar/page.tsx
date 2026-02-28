
"use client"

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, isSameDay, addHours } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Download, Plus, Clock, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  location?: string;
  description?: string;
}

const initialEvents: CalendarEvent[] = [
  { id: "1", title: "Family Lunch", date: new Date(new Date().setHours(13, 0, 0, 0)), location: "Grandma's House", description: "Monthly reunion" },
  { id: "2", title: "Grocery Shopping", date: new Date(new Date().setDate(new Date().getDate() + 1)), location: "Big Bazaar" },
  { id: "3", title: "Doctor Appointment", date: new Date(new Date().setDate(new Date().getDate() + 2)), description: "Regular health checkup" },
];

export default function CalendarPage() {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", location: "", description: "" });

  const selectedDayEvents = useMemo(() => {
    if (!date) return [];
    return events.filter(event => isSameDay(event.date, date));
  }, [date, events]);

  const handleAddEvent = () => {
    if (newEvent.title && date) {
      const event: CalendarEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: newEvent.title,
        location: newEvent.location,
        description: newEvent.description,
        date: date,
      };
      setEvents([...events, event]);
      setNewEvent({ title: "", location: "", description: "" });
      setIsAddOpen(false);
    }
  };

  const exportToICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//HomIllu//Family Calendar//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
    
    events.forEach(event => {
      const dtStart = format(event.date, "yyyyMMdd'T'HHmmss'Z'");
      const dtEnd = format(addHours(event.date, 1), "yyyyMMdd'T'HHmmss'Z'");
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
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleAddEvent}>{t("common.add")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
            <ScrollArea className="h-[400px] pr-4">
              {selectedDayEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayEvents.map((event) => (
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
                              {format(event.date, "p")}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {event.description && (
                        <p className="mt-3 text-sm text-muted-foreground border-t pt-2 border-dashed">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
