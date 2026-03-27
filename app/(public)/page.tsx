export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Hammer,
  Shield,
  Star,
  Users,
  Calendar,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ProjectCard } from "@/components/renovation/ProjectCard";
import { prisma } from "@/lib/prisma";

const trustLogos = [
  { name: "Airbnb", icon: Home, color: "text-pink-500" },
  { name: "Booking.com", icon: Calendar, color: "text-blue-600" },
  { name: "Google Reviews", icon: Star, color: "text-yellow-500" },
];

const valueProps = [
  {
    icon: Shield,
    title: "Reserva Segura",
    description: "Pago seguro a través de Stripe. Tu dinero está protegido.",
  },
  {
    icon: Users,
    title: "Atención Personalizada",
    description: "Te acompañamos antes, durante y después de tu estadía.",
  },
  {
    icon: CheckCircle,
    title: "Propiedades Verificadas",
    description: "Todas nuestras propiedades están verificadas y mantenidas.",
  },
];

export default async function HomePage() {
  const properties = await prisma.property.findMany({
    where: { isActive: true },
    take: 3,
  });

  const projects = await prisma.project.findMany({
    where: { isActive: true },
    take: 2,
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

  const formattedProjects = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    area: p.area,
    beforeImages: p.beforeImages,
    afterImages: p.afterImages,
  }));

  return (
    <div className="flex flex-col">
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Alquileres y Remodelaciones en Chile
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Tu próximo hogar te está esperando
                </h1>
                <p className="text-xl text-muted-foreground max-w-[500px]">
                  Encuentra alojamientos únicos para tus vacaciones o transforma
                  tu espacio con nuestros servicios de remodelación profesional.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/alquileres">
                    <Home className="mr-2 h-5 w-5" />
                    Explorar Propiedades
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base">
                  <Link href="/remodelaciones">
                    <Hammer className="mr-2 h-5 w-5" />
                    Ver Remodelaciones
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"
                      alt="Propiedad en alquiler"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"
                      alt="Proyecto de remodelación"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustLogos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <logo.icon className={`h-6 w-6 ${logo.color}`} />
                <span className="text-sm font-medium">{logo.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-sm font-medium ml-2">4.9/5 (120+ reseñas)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Propiedades Destacadas
              </h2>
              <p className="text-muted-foreground mt-2">
                Las mejores opciones para tu próxima estadía
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/alquileres">
                Ver Todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {formattedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-12 bg-primary/5 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  Reservá directo y ahorrá
                </h3>
                <p className="text-muted-foreground">
                  Al reservar directamente con nosotros, evitás las comisiones de
                  plataformas como Airbnb o Booking.com. ¡Mejor precio garantizado!
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/alquileres">Buscar Propiedades</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Nuestros Trabajos
              </h2>
              <p className="text-muted-foreground mt-2">
                Transformamos espacios con calidad y profesionalismo
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/remodelaciones">
                Ver Portfolio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {formattedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-muted-foreground mt-2">
              Tu satisfacción es nuestra prioridad
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {valueProps.map((prop) => (
              <Card key={prop.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <prop.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{prop.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {prop.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Ya sea que busques el lugar perfecto para tu vacaciones o quieras
            remodelar tu hogar, estamos aquí para ayudarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base"
            >
              <Link href="/alquileres">Buscar Alojamiento</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/remodelaciones#contacto">Solicitar Cotización</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
