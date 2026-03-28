"use client";

import { useEffect, useState } from "react";
import {
  addMonths,
  subMonths,
  format,
  isSameDay,
  isWithinInterval,
  isBefore,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect?: (checkIn: Date, checkOut: Date) => void;
}

export function AvailabilityCalendar({
  propertyId,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/reservations/check?propertyId=${encodeURIComponent(propertyId)}`
        );
        if (!res.ok) {
          throw new Error("Error al cargar disponibilidad");
        }
        const data: { blockedDates: string[] } = await res.json();
        if (cancelled) return;
        setBlockedDates(
          (data.blockedDates ?? []).map((iso) => startOfDay(new Date(iso)))
        );
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setLoadError("No se pudo cargar el calendario. Intentá de nuevo.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const today = startOfDay(new Date());

  const isBlocked = (date: Date) => {
    return blockedDates.some((blocked) => isSameDay(blocked, date));
  };

  const isInSelection = (date: Date) => {
    if (!selectionStart) return false;
    const endDate = selectionEnd || hoverDate;
    if (!endDate) return isSameDay(date, selectionStart);

    const start = selectionStart < endDate ? selectionStart : endDate;
    const end = selectionStart < endDate ? endDate : selectionStart;

    return isWithinInterval(date, { start, end: new Date(end.getTime() - 1) });
  };

  const isSelectionStart = (date: Date) => {
    if (!selectionStart) return false;
    const endDate = selectionEnd || hoverDate;
    if (!endDate) return isSameDay(date, selectionStart);

    const start = selectionStart < endDate ? selectionStart : endDate;
    return isSameDay(date, start);
  };

  const isSelectionEnd = (date: Date) => {
    if (!selectionStart) return false;
    const endDate = selectionEnd || hoverDate;
    if (!endDate) return false;

    const end = selectionStart < endDate ? endDate : selectionStart;
    return isSameDay(date, end);
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today) || isBlocked(date)) return;

    if (!selectionStart || selectionEnd) {
      setSelectionStart(date);
      setSelectionEnd(null);
    } else {
      if (isBefore(date, selectionStart)) {
        setSelectionEnd(selectionStart);
        setSelectionStart(date);
      } else {
        setSelectionEnd(date);
      }

      if (onDateSelect) {
        const start = isBefore(date, selectionStart) ? date : selectionStart;
        const end = isBefore(date, selectionStart) ? selectionStart : date;
        onDateSelect(start, end);
      }
    }
  };

  const handleDateHover = (date: Date) => {
    if (selectionStart && !selectionEnd) {
      setHoverDate(date);
    }
  };

  const renderMonth = (monthDate: Date) => {
    const firstDayOfMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    );
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), i));
    }

    const weekDays = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

    return (
      <div className="flex-1">
        <h3 className="mb-2 text-center font-semibold">
          {format(monthDate, "MMMM yyyy", { locale: es })
            .charAt(0)
            .toUpperCase() +
            format(monthDate, "MMMM yyyy", { locale: es }).slice(1)}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-1 text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isPast = isBefore(date, today);
            const blocked = isBlocked(date);
            const disabled = isPast || blocked;
            const inSelection = isInSelection(date);
            const isStart = isSelectionStart(date);
            const isEnd = isSelectionEnd(date);

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => handleDateHover(date)}
                disabled={disabled}
                className={cn(
                  "aspect-square rounded-md text-sm transition-colors",
                  disabled && "cursor-not-allowed text-muted-foreground/50",
                  !disabled && !inSelection && "hover:bg-accent",
                  !disabled && inSelection && "bg-primary/20",
                  isStart && "rounded-l-md bg-primary text-primary-foreground",
                  isEnd && "rounded-r-md bg-primary text-primary-foreground",
                  isStart &&
                    isEnd &&
                    "rounded-md bg-primary text-primary-foreground",
                  !isStart &&
                    !isEnd &&
                    inSelection &&
                    "bg-primary/10"
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="flex min-h-[280px] items-center justify-center gap-2 text-muted-foreground"
        data-property-id={propertyId}
      >
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="text-sm">Cargando disponibilidad…</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <p
        className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        data-property-id={propertyId}
      >
        {loadError}
      </p>
    );
  }

  return (
    <div data-property-id={propertyId}>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </span>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {renderMonth(currentMonth)}
        {renderMonth(addMonths(currentMonth, 1))}
      </div>

      {selectionStart && (
        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-sm">
            {selectionEnd ? (
              <>
                <strong>Check-in:</strong>{" "}
                {format(selectionStart, "dd/MM/yyyy", { locale: es })} -{" "}
                <strong>Check-out:</strong>{" "}
                {format(selectionEnd, "dd/MM/yyyy", { locale: es })}
              </>
            ) : (
              <>
                <strong>Check-in:</strong>{" "}
                {format(selectionStart, "dd/MM/yyyy", { locale: es })} - Selecciona
                fecha de salida
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
