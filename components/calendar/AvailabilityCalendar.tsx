"use client";

import { useState } from "react";
import { addMonths, subMonths, format, isSameDay, isWithinInterval, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  propertyId: string;
  blockedDates: Date[];
  onDateSelect?: (checkIn: Date, checkOut: Date) => void;
}

export function AvailabilityCalendar({
  propertyId,
  blockedDates,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

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
        <h3 className="text-center font-semibold mb-2">
          {format(monthDate, "MMMM yyyy", { locale: es })
            .charAt(0)
            .toUpperCase() +
            format(monthDate, "MMMM yyyy", { locale: es }).slice(1)}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-muted-foreground py-1"
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
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => handleDateHover(date)}
                disabled={disabled}
                className={cn(
                  "aspect-square text-sm rounded-md transition-colors",
                  disabled && "text-muted-foreground/50 cursor-not-allowed",
                  !disabled && !inSelection && "hover:bg-accent",
                  !disabled && inSelection && "bg-primary/20",
                  isStart && "bg-primary text-primary-foreground rounded-l-md",
                  isEnd && "bg-primary text-primary-foreground rounded-r-md",
                  isStart &&
                    isEnd &&
                    "bg-primary text-primary-foreground rounded-md",
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
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
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderMonth(currentMonth)}
        {renderMonth(addMonths(currentMonth, 1))}
      </div>

      {selectionStart && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
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
                {format(selectionStart, "dd/MM/yyyy", { locale: es })} - Selcciona
                fecha de salida
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
