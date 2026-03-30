import { prisma } from "@/lib/prisma";
import { ReservationsTable } from "@/components/admin/ReservationsTable";

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    include: {
      property: { select: { name: true } },
    },
    orderBy: { checkIn: "asc" },
    take: 2000,
  });

  const rows = reservations.map((r) => ({
    id: r.id,
    guestName: r.guestName,
    guestEmail: r.guestEmail,
    guestPhone: r.guestPhone,
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    totalPrice: Number(r.totalPrice),
    source: r.source,
    lifecycleStatus: r.lifecycleStatus,
    paymentStatus: r.paymentStatus,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    property: r.property,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Airbnb · Booking.com · Directas — fuente única de verdad
        </p>
      </div>
      <ReservationsTable reservations={rows} />
    </div>
  );
}
