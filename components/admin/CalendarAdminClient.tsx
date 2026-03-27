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
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminCalendarSourceBg } from "@/lib/admin-badges";

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
    <div className="space-y-8">
      <AdminPageHeader
        title="Calendario"
        description="Vista mensual por propiedad: reservas por canal y bloqueos (incluye iCal). Usá “Bloquear fechas” para cierres manuales."
        actions={
          <>
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              type="button"
              variant="outline"
              className="border-[var(--brand-border)]"
            >
              <RefreshCw
                className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")}
              />
              Sincronizar iCal
            </Button>
            <Button
              type="button"
              className="bg-[var(--headline)] text-white hover:bg-[var(--headline)]/90"
              onClick={() => setBlockOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Bloquear fechas
            </Button>
          </>
        }
      />

      {syncMsg && (
        <p className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-accent-soft)] px-4 py-3 text-sm text-[var(--headline)]">
          {syncMsg}
        </p>
      )}

      <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-[var(--brand-border)] bg-white p-4 shadow-sm md:flex-row">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            type="button"
            className="border-[var(--brand-border)]"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[200px] text-center font-display text-xl font-normal capitalize text-[var(--headline)]">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            type="button"
            className="border-[var(--brand-border)]"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-full border-[var(--brand-border)] md:w-[240px]">
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

      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-2 rounded-md border border-dashed border-[var(--brand-border)] bg-[var(--bg-surface)]/80 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]">
        <span className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-sm", adminCalendarSourceBg("DIRECT"))} />{" "}
          Directa
        </span>
        <span className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-sm", adminCalendarSourceBg("AIRBNB"))} />{" "}
          Airbnb
        </span>
        <span className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-sm", adminCalendarSourceBg("BOOKING"))} />{" "}
          Booking
        </span>
        <span className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-sm", adminCalendarSourceBg("MANUAL"))} />{" "}
          Manual
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-600" /> Bloqueado
        </span>
      </div>

      <div className="grid gap-4">
        {(selectedProperty === "all" ? properties : properties.filter((p) => p.id === selectedProperty)).map(
          (property) => (
            <div key={property.id} className="space-y-3">
              <h3 className="font-display text-lg font-normal text-[var(--headline)]">
                {property.name}
              </h3>
              <div className="overflow-x-auto rounded-lg border border-[var(--brand-border)] bg-white p-4 shadow-sm">
                <div className="grid min-w-[700px] grid-cols-7 gap-2">
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
                          "min-h-[80px] rounded-md border border-[var(--brand-border)]/70 bg-[var(--bg)]/50 p-1 text-sm",
                          isToday && "ring-2 ring-[var(--brand-accent)] ring-offset-1"
                        )}
                      >
                        <div className="font-medium text-xs mb-1">
                          {format(day, "d")}
                        </div>
                        {dayReservations.map((res) => (
                          <div
                            key={res.id}
                            className={cn(
                              "mb-1 truncate rounded px-1 py-0.5 text-xs text-white",
                              adminCalendarSourceBg(res.source)
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
