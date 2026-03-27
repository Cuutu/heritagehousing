import { NextRequest, NextResponse } from "next/server";
import { getPropertyById } from "@/lib/repositories/property.repository";
import { getReservationsForProperty } from "@/lib/repositories/reservation.repository";
import { generateIcalFeed } from "@/lib/services/ical.service";
import { startOfDay, endOfDay, addMonths } from "date-fns";
import { PaymentStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const property = await getPropertyById(params.propertyId);

    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    const startDate = startOfDay(new Date());
    const endDate = endOfDay(addMonths(new Date(), 12));

    const reservations = await getReservationsForProperty(
      property.id,
      startDate,
      endDate
    );

    const activeReservations = reservations
      .filter((r) => r.paymentStatus === PaymentStatus.PAID)
      .map((r) => ({
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        guestName: r.guestName,
      }));

    const icalContent = generateIcalFeed(property.name, activeReservations);

    return new NextResponse(icalContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${property.slug}.ics"`,
      },
    });
  } catch (error) {
    console.error("iCal export error:", error);
    return NextResponse.json(
      { error: "Error al generar iCal" },
      { status: 500 }
    );
  }
}
