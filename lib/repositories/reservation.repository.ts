import { prisma } from "@/lib/prisma";

export async function getAllReservations(filters?: {
  propertyId?: string;
  source?: string;
  status?: string;
  checkInFrom?: Date;
  checkInTo?: Date;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.propertyId) where.propertyId = filters.propertyId;
  if (filters?.source) where.source = filters.source;
  if (filters?.status) where.paymentStatus = filters.status;
  if (filters?.checkInFrom || filters?.checkInTo) {
    where.checkIn = {};
    if (filters.checkInFrom) (where.checkIn as Record<string, Date>).gte = filters.checkInFrom;
    if (filters.checkInTo) (where.checkIn as Record<string, Date>).lte = filters.checkInTo;
  }

  return prisma.reservation.findMany({
    where,
    include: {
      property: {
        select: {
          name: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      property: true,
    },
  });
}

export async function getReservationByStripeId(stripeId: string) {
  return prisma.reservation.findFirst({
    where: { stripeId },
    include: {
      property: true,
    },
  });
}

export async function createReservation(data: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  totalPrice: number;
  stripeId?: string;
  notes?: string;
}) {
  return prisma.reservation.create({
    data: {
      propertyId: data.propertyId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone || null,
      totalPrice: data.totalPrice,
      source: "DIRECT",
      paymentStatus: "PENDING",
      stripeId: data.stripeId,
      notes: data.notes,
    },
    include: {
      property: true,
    },
  });
}

export async function updateReservationStatus(id: string, status: string) {
  return prisma.reservation.update({
    where: { id },
    data: { paymentStatus: status },
  });
}

export async function updateReservationStripeId(id: string, stripeId: string) {
  return prisma.reservation.update({
    where: { id },
    data: { stripeId },
  });
}

export async function checkDateConflict(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  excludeReservationId?: string
): Promise<boolean> {
  const conflictingReservation = await prisma.reservation.findFirst({
    where: {
      propertyId,
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      paymentStatus: { in: ["PENDING", "PAID"] },
      AND: [
        { checkIn: { lt: checkOut } },
        { checkOut: { gt: checkIn } },
      ],
    },
  });

  if (conflictingReservation) return true;

  const blockedDate = await prisma.blockedDate.findFirst({
    where: {
      propertyId,
      date: {
        gte: checkIn,
        lt: checkOut,
      },
    },
  });

  return !!blockedDate;
}

export async function getReservationsForProperty(
  propertyId: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.reservation.findMany({
    where: {
      propertyId,
      checkIn: { lte: endDate },
      checkOut: { gte: startDate },
      paymentStatus: { in: ["PENDING", "PAID"] },
    },
  });
}
