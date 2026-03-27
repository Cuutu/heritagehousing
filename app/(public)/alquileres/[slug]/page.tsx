export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { AvailabilityCalendar } from "@/components/calendar/AvailabilityCalendar";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { formatCLP } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function PropertyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const property = await prisma.property.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      blockedDates: {
        where: { date: { gte: new Date() } },
        select: { date: true, source: true },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const propertyData = {
    id: property.id,
    name: property.name,
    slug: property.slug,
    description: property.description,
    location: property.location,
    pricePerNight: Number(property.pricePerNight),
    maxGuests: property.maxGuests,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    images: property.images,
    amenities: property.amenities.map((a) => ({ key: a.toLowerCase(), label: a })),
    blockedDates: property.blockedDates,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/alquileres"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Volver a alquileres
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{propertyData.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{propertyData.location}</span>
            </div>
          </div>

          <PropertyGallery
            images={propertyData.images}
            propertyName={propertyData.name}
          />

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>{propertyData.maxGuests} huéspedes</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-muted-foreground" />
              <span>{propertyData.bedrooms} dormitorios</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-muted-foreground" />
              <span>{propertyData.bathrooms} baños</span>
            </div>
          </div>

          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="amenities">Comodidades</TabsTrigger>
              <TabsTrigger value="location">Ubicación</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <div className="prose prose-sm max-w-none">
                {propertyData.description.split("\n\n").map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="amenities" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {propertyData.amenities.map((amenity) => (
                  <div
                    key={amenity.key}
                    className="flex items-center gap-3 text-sm"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{amenity.label}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="location" className="mt-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  {propertyData.location}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <h2 className="text-xl font-semibold mb-4">Disponibilidad</h2>
            <AvailabilityCalendar
              propertyId={propertyData.id}
              blockedDates={propertyData.blockedDates.map((b) => new Date(b.date))}
            />
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded" />
                <span className="text-muted-foreground">No disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary/20 rounded" />
                <span className="text-muted-foreground">Seleccionable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="text-2xl font-bold">
                    {formatCLP(propertyData.pricePerNight)}
                  </span>
                  <span className="text-muted-foreground"> / noche</span>
                </div>

                <BookingFlow property={propertyData} />
              </CardContent>
            </Card>

            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Reservá directo:</strong> Ahorrás hasta un 15% en
                comisiones de plataformas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
