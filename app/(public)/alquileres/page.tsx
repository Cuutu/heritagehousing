export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property/PropertyCard";

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Alquileres Vacacionales
        </h1>
        <p className="text-muted-foreground">
          Encontrá el lugar perfecto para tu próxima estadía en Chile
        </p>
      </div>

      <div className="bg-primary/5 rounded-xl p-4 mb-8">
        <p className="text-center text-sm text-primary font-medium">
          Reservá directo y ahorrate las comisiones de Airbnb y Booking.com
        </p>
      </div>

      {formattedProperties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No hay propiedades disponibles en este momento.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {formattedProperties.length} propiedad
            {formattedProperties.length !== 1 ? "es" : ""} encontrada
            {formattedProperties.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {formattedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
