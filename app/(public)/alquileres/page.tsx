export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property/PropertyCard";
import { RentalsMap } from "@/components/property/RentalsMap";
import type { RentalsMapMarker } from "@/components/property/RentalsMap";

function googleMapsSearchUrl(
  name: string,
  location: string,
  mapAddress: string | null
) {
  const q = mapAddress
    ? `${mapAddress}, ${location}, Chile`
    : `${name}, ${location}, Chile`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

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
    mapAddress: p.mapAddress,
    latitude: p.latitude,
    longitude: p.longitude,
    pricePerNight: Number(p.pricePerNight),
    maxGuests: p.maxGuests,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    images: p.images,
  }));

  const mapMarkers: RentalsMapMarker[] = formattedProperties
    .filter(
      (p) =>
        p.latitude != null &&
        p.longitude != null &&
        !Number.isNaN(p.latitude) &&
        !Number.isNaN(p.longitude)
    )
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      location: p.location,
      mapAddress: p.mapAddress,
      latitude: p.latitude as number,
      longitude: p.longitude as number,
    }));

  const withoutCoords = formattedProperties.filter(
    (p) => p.latitude == null || p.longitude == null
  );

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
            {mapMarkers.length > 0 && (
              <section className="mt-16 space-y-4" aria-label="Mapa de propiedades">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight">
                      Ubicaciones
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Hacé clic en un marcador para ver la ficha.
                    </p>
                  </div>
                </div>
                <RentalsMap markers={mapMarkers} />
                <p className="text-xs text-muted-foreground">
                  Mapa ©{" "}
                  <a
                    className="underline underline-offset-2 hover:text-foreground"
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                  >
                    OpenStreetMap
                  </a>
                </p>
              </section>
            )}

            {withoutCoords.length > 0 && (
              <div
                className={
                  mapMarkers.length > 0
                    ? "mt-10 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground"
                    : "mt-16 rounded-xl border border-amber-900/15 bg-amber-900/[0.04] px-4 py-3 text-sm text-muted-foreground"
                }
              >
                {mapMarkers.length === 0 ? (
                  <>
                    <p className="font-medium text-foreground">
                      Aún no hay coordenadas en el mapa.
                    </p>
                    <p className="mt-1">
                      Podés abrir cada zona en Google Maps mientras el equipo
                      carga latitud y longitud desde el panel de administración.
                    </p>
                  </>
                ) : (
                  <p>
                    Algunas propiedades solo tienen zona (sin pin exacto). Abrí
                    en Maps:
                  </p>
                )}
                <ul className="mt-3 space-y-2">
                  {withoutCoords.map((p) => (
                    <li key={p.id}>
                      <a
                        href={googleMapsSearchUrl(
                          p.name,
                          p.location,
                          p.mapAddress
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        {p.name} — {p.location}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
