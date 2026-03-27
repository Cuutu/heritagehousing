import { prisma } from "@/lib/prisma";
import { getAllProperties } from "@/lib/repositories/property.repository";
import { ReservationsAdminClient } from "@/components/admin/ReservationsAdminClient";

export default async function AdminReservationsPage() {
  const [reservations, properties] = await Promise.all([
    prisma.reservation.findMany({
      include: { property: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    getAllProperties(),
  ]);

  const rows = reservations.map((r) => ({
    id: r.id,
    propertyId: r.propertyId,
    guestName: r.guestName,
    guestEmail: r.guestEmail,
    propertyName: r.property.name,
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    totalPrice: Number(r.totalPrice),
    source: r.source,
    paymentStatus: r.paymentStatus,
    createdAt: r.createdAt.toISOString(),
  }));

  const propertyOptions = properties.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <ReservationsAdminClient
      reservations={rows}
      properties={propertyOptions}
    />
  );
}
