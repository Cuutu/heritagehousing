export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const propertyId =
    typeof searchParams.propertyId === "string"
      ? searchParams.propertyId
      : null;
  const checkIn =
    typeof searchParams.checkIn === "string" ? searchParams.checkIn : null;
  const checkOut =
    typeof searchParams.checkOut === "string" ? searchParams.checkOut : null;
  const guestsRaw =
    typeof searchParams.guests === "string" ? searchParams.guests : "1";

  if (!propertyId || !checkIn || !checkOut) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">
          Faltan datos de la reserva. Elegí fechas en la propiedad e intentá de
          nuevo.
        </p>
        <Link
          href="/alquileres"
          className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver alquileres
        </Link>
      </div>
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Las fechas no son válidas.</p>
        <Link
          href="/alquileres"
          className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver alquileres
        </Link>
      </div>
    );
  }

  const guests = Math.max(1, parseInt(guestsRaw, 10) || 1);

  const property = await prisma.property.findUnique({
    where: { id: propertyId, isActive: true },
  });

  if (!property) {
    notFound();
  }

  if (guests > property.maxGuests) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">
          La cantidad de huéspedes supera el máximo permitido para esta
          propiedad.
        </p>
        <Link
          href={`/alquileres/${property.slug}`}
          className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Volver a la propiedad
        </Link>
      </div>
    );
  }

  const propertyData = {
    id: property.id,
    name: property.name,
    pricePerNight: Number(property.pricePerNight),
    maxGuests: property.maxGuests,
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-12 md:py-16">
      <Link
        href={`/alquileres/${property.slug}`}
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Volver a la propiedad
      </Link>

      <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
        Completar reserva
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Datos de contacto y pago seguro con Stripe.
      </p>

      <Card className="mt-8 rounded-2xl border-0 shadow-sm ring-1 ring-border/60">
        <CardContent className="p-6 md:p-7">
          <BookingFlow
            mode="complete"
            property={propertyData}
            initialCheckInIso={checkIn}
            initialCheckOutIso={checkOut}
            initialGuests={guests}
          />
        </CardContent>
      </Card>
    </div>
  );
}
