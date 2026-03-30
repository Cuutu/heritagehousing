import { prisma } from "@/lib/prisma";
import { calculateTotalPrice } from "@/lib/services/availability.service";
import { sendBookingConfirmation } from "@/lib/services/email.service";
import {
  PaymentStatus as PS,
  ReservationLifecycleStatus,
} from "@prisma/client";

interface ReservationData {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestCount?: number;
  notes?: string;
}

export async function createNewReservation(
  data: ReservationData,
  stripeSessionId?: string
) {
  const totalPrice = await calculateTotalPrice(
    data.propertyId,
    data.checkIn,
    data.checkOut
  );

  const reservation = await prisma.reservation.create({
    data: {
      propertyId: data.propertyId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone || null,
      guestCount: data.guestCount ?? 1,
      totalPrice,
      source: "DIRECT",
      paymentStatus: PS.PENDING,
      lifecycleStatus: ReservationLifecycleStatus.PENDING,
      stripeId: stripeSessionId ?? null,
      notes: data.notes,
    },
    include: {
      property: true,
    },
  });

  return reservation;
}

/** Marks reservation paid after Stripe checkout; stores session id and emails guest. Idempotent if already PAID. */
export async function markReservationPaidFromStripe(
  reservationId: string,
  stripeSessionId: string
) {
  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { property: true },
  });

  if (!existing) {
    throw new Error(`Reservation not found: ${reservationId}`);
  }

  if (existing.paymentStatus === PS.PAID) {
    return existing;
  }

  const reservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      paymentStatus: PS.PAID,
      stripeId: stripeSessionId,
      lifecycleStatus: ReservationLifecycleStatus.CONFIRMED,
    },
    include: { property: true },
  });

  await sendBookingConfirmation(reservation);

  return reservation;
}

export async function cancelReservation(reservationId: string) {
  return prisma.reservation.update({
    where: { id: reservationId },
    data: {
      paymentStatus: PS.CANCELLED,
      lifecycleStatus: ReservationLifecycleStatus.CANCELLED,
    },
  });
}

export async function refundReservation(reservationId: string) {
  return prisma.reservation.update({
    where: { id: reservationId },
    data: { paymentStatus: PS.REFUNDED },
  });
}
