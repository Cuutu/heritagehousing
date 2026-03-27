import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { formatCLP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ConfirmacionReservaPage({
  searchParams,
}: {
  searchParams: { reservation_id?: string; session_id?: string };
}) {
  const { reservation_id } = searchParams;
  if (!reservation_id) {
    notFound();
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservation_id },
    include: { property: true },
  });

  if (!reservation) {
    notFound();
  }

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56912345678";
  const waText = encodeURIComponent(
    `Hola, acabo de reservar ${reservation.property.name} (reserva ${reservation.id}).`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

  const isPaid = reservation.paymentStatus === PaymentStatus.PAID;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <Card className="border-stone-200 bg-stone-50/80 shadow-sm">
        <CardHeader className="text-center pb-2">
          {isPaid ? (
            <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto mb-2" />
          ) : (
            <Loader2 className="h-14 w-14 text-amber-600 mx-auto mb-2 animate-spin" />
          )}
          <CardTitle className="text-2xl text-stone-900">
            {isPaid ? "¡Reserva confirmada!" : "Procesando tu pago"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-stone-800">
          {!isPaid && (
            <p className="text-sm text-center text-stone-600">
              Tu pago se está confirmando. En unos segundos actualizá esta página
              o revisá tu correo.
            </p>
          )}

          <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-stone-500">Propiedad</span>
              <span className="font-medium text-right">
                {reservation.property.name}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-500">Check-in</span>
              <span>
                {format(reservation.checkIn, "dd/MM/yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-500">Check-out</span>
              <span>
                {format(reservation.checkOut, "dd/MM/yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-500">Huésped</span>
              <span>{reservation.guestName}</span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-stone-100">
              <span className="text-stone-500">Total</span>
              <span className="font-semibold">
                {formatCLP(Number(reservation.totalPrice))}
              </span>
            </div>
          </div>

          {isPaid && (
            <p className="text-center text-sm text-stone-600">
              Recibirás un email de confirmación en{" "}
              <strong>{reservation.guestEmail}</strong>.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contactar por WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-stone-300">
              <Link href="/alquileres">Ver más alquileres</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
