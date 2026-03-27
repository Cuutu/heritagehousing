"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const properties = [
  { id: "1", name: "Depto Centro Santiago" },
  { id: "2", name: "Casa Providencia" },
  { id: "3", name: "Depto Viña del Mar" },
  { id: "4", name: "Cabaña Pucón" },
];

const reservations = [
  {
    id: "1",
    propertyId: "1",
    checkIn: new Date("2026-03-28"),
    checkOut: new Date("2026-03-30"),
    guestName: "María González",
    source: "DIRECT",
  },
  {
    id: "2",
    propertyId: "2",
    checkIn: new Date("2026-04-01"),
    checkOut: new Date("2026-04-05"),
    guestName: "Carlos López",
    source: "AIRBNB",
  },
  {
    id: "3",
    propertyId: "3",
    checkIn: new Date("2026-04-02"),
    checkOut: new Date("2026-04-07"),
    guestName: "Ana Martínez",
    source: "BOOKING",
  },
];

const blockedDates = [
  {
    id: "1",
    propertyId: "1",
    date: new Date("2026-03-28"),
    source: "airbnb",
  },
  {
    id: "2",
    propertyId: "1",
    date: new Date("2026-03-29"),
    source: "airbnb",
  },
];

const sourceColors: Record<string, string> = {
  DIRECT: "bg-green-500",
  AIRBNB: "bg-pink-500",
  BOOKING: "bg-blue-500",
  MANUAL: "bg-gray-500",
  airbnb: "bg-pink-500",
  booking: "bg-blue-500",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [isSyncing, setIsSyncing] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/sync/ical", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      });
      const data = await response.json();
      console.log("Sync result:", data);
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getReservationsForDay = (day: Date) => {
    return reservations.filter((res) => {
      const matchesProperty =
        selectedProperty === "all" || res.propertyId === selectedProperty;
      const matchesDay = isWithinInterval(day, {
        start: res.checkIn,
        end: new Date(res.checkOut.getTime() - 1),
      });
      return matchesProperty && matchesDay;
    });
  };

  const getBlockedDatesForDay = (day: Date) => {
    return blockedDates.filter((blocked) => {
      const matchesProperty =
        selectedProperty === "all" || blocked.propertyId === selectedProperty;
      return matchesProperty && isSameDay(blocked.date, day);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Vista unificada de disponibilidad
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")}
            />
            Sincronizar iCal
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Bloquear Fechas
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: es })
              .charAt(0)
              .toUpperCase() +
              format(currentDate, "MMMM yyyy", { locale: es }).slice(1)}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por propiedad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las propiedades</SelectItem>
            {properties.map((prop) => (
              <SelectItem key={prop.id} value={prop.id}>
                {prop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-sm">Directa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-pink-500" />
          <span className="text-sm">Airbnb</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-sm">Booking.com</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-400" />
          <span className="text-sm">Manual</span>
        </div>
      </div>

      <div className="grid gap-4">
        {selectedProperty === "all"
          ? properties.map((property) => (
              <div key={property.id} className="space-y-2">
                <h3 className="font-semibold">{property.name}</h3>
                <div className="border rounded-lg p-4 overflow-x-auto">
                  <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                    {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
                      <div
                        key={d}
                        className="text-center text-sm font-medium text-muted-foreground py-2"
                      >
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {days.map((day) => {
                      const dayReservations = reservations.filter(
                        (r) =>
                          r.propertyId === property.id &&
                          isWithinInterval(day, {
                            start: r.checkIn,
                            end: new Date(r.checkOut.getTime() - 1),
                          })
                      );
                      const dayBlocked = blockedDates.filter(
                        (b) =>
                          b.propertyId === property.id &&
                          isSameDay(b.date, day)
                      );
                      const isToday = isSameDay(day, new Date());

                      return (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "min-h-[80px] border rounded-md p-1 text-sm",
                            isToday && "ring-2 ring-primary"
                          )}
                        >
                          <div className="font-medium text-xs mb-1">
                            {format(day, "d")}
                          </div>
                          {dayReservations.map((res) => (
                            <div
                              key={res.id}
                              className={cn(
                                "text-xs text-white px-1 py-0.5 rounded mb-1 truncate",
                                sourceColors[res.source]
                              )}
                              title={`${res.guestName}`}
                            >
                              {res.guestName}
                            </div>
                          ))}
                          {dayBlocked.map((blocked) => (
                            <Badge
                              key={blocked.id}
                              variant="outline"
                              className="text-xs block mb-1"
                            >
                              Bloqueado ({blocked.source})
                            </Badge>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          : days.map((day) => {
              const dayReservations = getReservationsForDay(day);
              const dayBlocked = getBlockedDatesForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border rounded-lg p-4",
                    isToday && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                      {format(day, "EEEE, d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayReservations.map((res) => (
                      <div
                        key={res.id}
                        className={cn(
                          "text-sm text-white px-3 py-2 rounded",
                          sourceColors[res.source]
                        )}
                      >
                        <span className="font-medium">{res.guestName}</span>
                      </div>
                    ))}
                    {dayBlocked.map((blocked) => (
                      <div
                        key={blocked.id}
                        className="text-sm bg-muted px-3 py-2 rounded"
                      >
                        Bloqueado ({blocked.source})
                      </div>
                    ))}
                    {dayReservations.length === 0 &&
                      dayBlocked.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Disponible
                        </p>
                      )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
