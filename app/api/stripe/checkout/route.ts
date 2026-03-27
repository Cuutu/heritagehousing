import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/services/stripe.service";
import { createNewReservation } from "@/lib/services/reservation.service";
import { getPropertyById } from "@/lib/repositories/property.repository";
import { z } from "zod";

const checkoutSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guestCount: z.coerce.number().int().min(1),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const property = await getPropertyById(data.propertyId);
    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    const reservation = await createNewReservation({
      propertyId: data.propertyId,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestCount: data.guestCount,
      notes: data.notes,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await createCheckoutSession(
      [
        {
          propertyId: data.propertyId,
          checkIn: new Date(data.checkIn),
          checkOut: new Date(data.checkOut),
          guestCount: data.guestCount,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          notes: data.notes,
        },
      ],
      `${appUrl}/alquileres/${property.slug}?success=true&reservation=${reservation.id}`,
      `${appUrl}/alquileres/${property.slug}?cancelled=true`
    );

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al procesar la reserva" },
      { status: 500 }
    );
  }
}
