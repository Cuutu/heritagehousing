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
  startOfDay,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { syncIcalAdminAction } from "@/app/actions/sync.actions";
import { addManualBlockedRangeAction } from "@/app/actions/blockedDate.actions";

export type CalProperty = { id: string; name: string };
export type CalReservation = {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  source: string;
};
export type CalBlocked = {
  id: string;
  propertyId: string;
  date: string;
  source: string;
};

const sourceColors: Record<string, string> = {
  DIRECT: "bg-blue-600",
  AIRBNB: "bg-pink-500",
  BOOKING: "bg-indigo-600",
  MANUAL: "bg-stone-500",
  airbnb: "bg-pink-500",
  booking: "bg-indigo-600",
};

export function CalendarAdminClient({
  properties,
  reservations,
  blockedDates,
}: {
  properties: CalProperty[];
  reservations: CalReservation[];
  blockedDates: CalBlocked[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockProp, setBlockProp] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);

  const resParsed = reservations.map((r) => ({
    ...r,
    checkIn: new Date(r.checkIn),
    checkOut: new Date(r.checkOut),
  }));

  const blockedParsed = blockedDates.map((b) => ({
    ...b,
    date: new Date(b.date),
  }));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    try {
      const data = await syncIcalAdminAction();
      setSyncMsg(
        data.success ? data.message : (data.error ?? "Error")
      );
      if (data.success) window.location.reload();
    } finally {
      setIsSyncing(false);
    }
  };

  const submitBlock = async () => {
    if (!blockProp || !blockStart || !blockEnd) return;
    setBlockLoading(true);
    try {
      const r = await addManualBlockedRangeAction({
        propertyId: blockProp,
        startDate: new Date(blockStart),
        endDate: new Date(blockEnd),
      });
      if (r.success) {
        setBlockOpen(false);
        window.location.reload();
      } else {
        setSyncMsg(r.error ?? "Error");
      }
    } finally {
      setBlockLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">Vista unificada de ocupación</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSync} disabled={isSyncing} type="button">
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")}
            />
            Sincronizar iCal
          </Button>
          <Button type="button" onClick={() => setBlockOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Bloquear fechas
          </Button>
        </div>
      </div>

      {syncMsg && (
        <p className="text-sm border rounded-md p-3 bg-muted">{syncMsg}</p>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Propiedad" />
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

      <div className="flex gap-2 mb-4 flex-wrap text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600" /> Directa
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-pink-500" /> Airbnb
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-indigo-600" /> Booking
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-stone-500" /> Manual
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-600" /> Bloqueado
        </span>
      </div>

      <div className="grid gap-4">
        {(selectedProperty === "all" ? properties : properties.filter((p) => p.id === selectedProperty)).map(
          (property) => (
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
                    const dayReservations = resParsed.filter((r) => {
                      if (r.propertyId !== property.id) return false;
                      const d0 = startOfDay(day);
                      return (
                        d0 >= startOfDay(r.checkIn) &&
                        d0 < startOfDay(r.checkOut)
                      );
                    });
                    const dayBlocked = blockedParsed.filter(
                      (b) =>
                        b.propertyId === property.id && isSameDay(b.date, day)
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
                              sourceColors[res.source] ?? "bg-stone-500"
                            )}
                            title={res.guestName}
                          >
                            {res.guestName}
                          </div>
                        ))}
                        {dayBlocked.map((blocked) => (
                          <Badge
                            key={blocked.id}
                            className="text-xs block mb-1 bg-red-600"
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
          )
        )}
      </div>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear fechas manualmente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label>Propiedad</Label>
              <Select value={blockProp} onValueChange={setBlockProp}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitBlock} disabled={blockLoading}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
