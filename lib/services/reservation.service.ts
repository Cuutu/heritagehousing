import { prisma } from "@/lib/prisma";
import { calculateTotalPrice } from "@/lib/services/availability.service";
import { sendConfirmationEmail } from "@/lib/services/email.service";

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
      totalPrice,
      source: "DIRECT",
      paymentStatus: "PENDING",
      stripeId: stripeSessionId,
      notes: data.notes,
    },
    include: {
      property: true,
    },
  });

  return reservation;
}

export async function confirmReservation(reservationId: string) {
  const reservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: { paymentStatus: "PAID" },
    include: { property: true },
  });

  await sendConfirmationEmail(reservation);

  return reservation;
}

export async function cancelReservation(reservationId: string) {
  return prisma.reservation.update({
    where: { id: reservationId },
    data: { paymentStatus: "CANCELLED" },
  });
}

export async function refundReservation(reservationId: string) {
  return prisma.reservation.update({
    where: { id: reservationId },
    data: { paymentStatus: "REFUNDED" },
  });
}
