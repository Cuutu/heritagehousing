import { prisma } from "@/lib/prisma";
import { CleaningDashboard } from "@/components/admin/CleaningDashboard";
import { addDays, startOfDay } from "date-fns";
import { ReservationLifecycleStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function LimpiezaPage() {
  const today = startOfDay(new Date());

  const [staff, assignments, upcomingCheckouts] = await Promise.all([
    prisma.cleaningStaff.findMany({
      where: { active: true },
      include: { properties: true },
      orderBy: { name: "asc" },
    }),
    prisma.cleaningAssignment.findMany({
      where: {
        cleaningDate: { gte: today, lte: addDays(today, 14) },
      },
      include: {
        staff: true,
        property: true,
        reservation: {
          select: { guestName: true, checkIn: true, checkOut: true },
        },
      },
      orderBy: { cleaningDate: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        checkOut: { gte: today, lte: addDays(today, 7) },
        lifecycleStatus: ReservationLifecycleStatus.CONFIRMED,
        cleaningAssignments: { none: {} },
      },
      include: { property: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Limpieza</h1>
        <p className="mt-1 text-sm text-gray-500">
          Asigná staff y enviá recordatorios por WhatsApp automáticamente
        </p>
      </div>
      <CleaningDashboard
        staff={staff}
        assignments={assignments}
        unassignedCheckouts={upcomingCheckouts}
      />
    </div>
  );
}
