import {
  getBlockedDatesInRange,
  getBlockedDatesForProperty,
} from "@/lib/repositories/blockedDate.repository";
import {
  getReservationsForProperty,
  checkDateConflict,
} from "@/lib/repositories/reservation.repository";
import { getPropertyById } from "@/lib/repositories/property.repository";
import {
  startOfDay,
  endOfDay,
  addDays,
  addYears,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
} from "date-fns";

export async function isDateAvailable(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const hasConflict = await checkDateConflict(propertyId, checkIn, checkOut);
  return !hasConflict;
}

/**
 * BlockedDate rows (iCal) + reservation nights (PENDING or PAID), merged for UI calendars.
 */
export async function getUnavailableDates(
  propertyId: string
): Promise<Date[]> {
  const startDate = startOfDay(new Date());
  const endDate = endOfDay(addYears(new Date(), 2));
  return getUnavailableDatesInRange(propertyId, startDate, endDate);
}

export async function getUnavailableDatesInRange(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<Date[]> {
  const blockedDates = await getBlockedDatesInRange(
    propertyId,
    startOfDay(startDate),
    endOfDay(endDate)
  );

  const reservations = await getReservationsForProperty(
    propertyId,
    startDate,
    endDate
  );

  const unavailableDates: Set<string> = new Set();

  blockedDates.forEach((bd) => {
    unavailableDates.add(startOfDay(bd.date).toISOString());
  });

  reservations.forEach((res) => {
    const days = eachDayOfInterval({
      start: startOfDay(res.checkIn),
      end: addDays(startOfDay(res.checkOut), -1),
    });
    days.forEach((day) => {
      unavailableDates.add(day.toISOString());
    });
  });

  return Array.from(unavailableDates).map((d) => parseISO(d));
}

export async function getUnifiedAvailability(
  startDate: Date,
  endDate: Date
): Promise<
  Map<string, { blockedDates: Date[]; reservationDates: Date[] }>
> {
  const properties = await import("@/lib/repositories/property.repository").then(
    (m) => m.getActiveProperties()
  );

  const availabilityMap = new Map<
    string,
    { blockedDates: Date[]; reservationDates: Date[] }
  >();

  for (const property of properties) {
    const blockedDates = await getBlockedDatesForProperty(property.id);
    const reservations = await getReservationsForProperty(
      property.id,
      startDate,
      endDate
    );

    const reservationDates: Date[] = [];
    reservations.forEach((res) => {
      const days = eachDayOfInterval({
        start: startOfDay(res.checkIn),
        end: addDays(startOfDay(res.checkOut), -1),
      });
      reservationDates.push(...days);
    });

    availabilityMap.set(property.id, {
      blockedDates: blockedDates.map((b) => b.date),
      reservationDates,
    });
  }

  return availabilityMap;
}

export async function calculateNights(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  const property = await getPropertyById(propertyId);
  if (!property) return 0;

  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, nights);
}

export async function calculateTotalPrice(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<number> {
  const property = await getPropertyById(propertyId);
  if (!property) return 0;

  const nights = await calculateNights(propertyId, checkIn, checkOut);
  return Number(property.pricePerNight) * nights;
}
