export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ArrowRight } from "lucide-react";

export default async function RentalsPage() {
  const properties = await prisma.property.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedProperties = properties.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    location: p.location,
    pricePerNight: Number(p.pricePerNight),
    maxGuests: p.maxGuests,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    images: p.images,
  }));

  return (
    <div className="border-b border-border/40">
      <div className="container mx-auto px-4 py-14 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Alojamientos
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Elegí tu estadía
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Propiedades curadas, reserva directa y precio sin comisiones de
            plataformas.
          </p>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          Reservá con nosotros y ahorrá vs. intermediarios
          <ArrowRight className="h-4 w-4 opacity-60" aria-hidden />
        </div>

        {formattedProperties.length === 0 ? (
          <div className="mt-20 rounded-2xl border border-dashed border-border/80 py-20 text-center">
            <p className="text-muted-foreground">
              No hay propiedades disponibles en este momento.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-16 text-sm text-muted-foreground">
              {formattedProperties.length}{" "}
              {formattedProperties.length === 1 ? "propiedad" : "propiedades"}
            </p>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {formattedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
