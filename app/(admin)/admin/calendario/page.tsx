import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { CalendarAdminClient } from "@/components/admin/CalendarAdminClient";
import { subMonths, addMonths } from "date-fns";

export default async function AdminCalendarPage() {
  const rangeStart = subMonths(new Date(), 1);
  const rangeEnd = addMonths(new Date(), 14);

  const [properties, reservations, blockedDates] = await Promise.all([
    prisma.property.findMany({ orderBy: { name: "asc" } }),
    prisma.reservation.findMany({
      where: {
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PAID] },
        checkOut: { gte: rangeStart },
        checkIn: { lte: rangeEnd },
      },
      select: {
        id: true,
        propertyId: true,
        checkIn: true,
        checkOut: true,
        guestName: true,
        source: true,
      },
    }),
    prisma.blockedDate.findMany({
      where: {
        date: { gte: rangeStart, lte: rangeEnd },
      },
    }),
  ]);

  return (
    <CalendarAdminClient
      properties={properties.map((p) => ({ id: p.id, name: p.name }))}
      reservations={reservations.map((r) => ({
        id: r.id,
        propertyId: r.propertyId,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        guestName: r.guestName,
        source: r.source,
      }))}
      blockedDates={blockedDates.map((b) => ({
        id: b.id,
        propertyId: b.propertyId,
        date: b.date.toISOString(),
        source: b.source,
      }))}
    />
  );
}
