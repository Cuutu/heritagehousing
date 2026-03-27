export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Shield, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ProjectCard } from "@/components/renovation/ProjectCard";
import { prisma } from "@/lib/prisma";

const pillars = [
  {
    icon: Shield,
    title: "Reserva segura",
    text: "Pagos con estándares actuales. Tu información protegida.",
  },
  {
    icon: Sparkles,
    title: "Curaduría real",
    text: "Cada espacio cumple un estándar claro de calidad y mantenimiento.",
  },
  {
    icon: Star,
    title: "Atención directa",
    text: "Hablás con quien gestiona la propiedad o el proyecto.",
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
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute inset-0 grain opacity-50" />
        <div className="pointer-events-none absolute -right-24 top-0 h-[520px] w-[520px] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-amber-900/[0.04] blur-3xl" />

        <div className="container relative mx-auto px-4 py-16 md:px-6 md:py-24 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <p
                className="animate-fade-up font-display text-xs font-semibold uppercase tracking-[0.28em] text-primary opacity-0"
                style={{ animationDelay: "0ms" }}
              >
                Alquileres · Remodelaciones · Chile
              </p>
              <h1
                className="animate-fade-up mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-foreground opacity-0"
                style={{ animationDelay: "80ms" }}
              >
                Espacios pensados para quedarse. O para transformarse.
              </h1>
              <p
                className="animate-fade-up mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground opacity-0"
                style={{ animationDelay: "160ms" }}
              >
                Elegí tu próxima estadía o encargá una remodelación con un equipo
                que entiende diseño, materiales y plazos.
              </p>
              <div
                className="animate-fade-up mt-10 flex flex-col gap-3 sm:flex-row sm:items-center opacity-0"
                style={{ animationDelay: "240ms" }}
              >
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full px-8 text-base font-medium"
                >
                  <Link href="/alquileres">
                    Ver alojamientos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-12 rounded-full px-6 text-base text-muted-foreground hover:text-foreground"
                >
                  <Link href="/remodelaciones">
                    Remodelaciones
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div className="grid grid-cols-12 gap-3 md:gap-4">
                <div className="col-span-7 animate-fade-in opacity-0 [animation-delay:320ms] [animation-fill-mode:forwards]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/50">
                    <Image
                      src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
                      alt="Interior de alojamiento"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      priority
                    />
                  </div>
                </div>
                <div className="col-span-5 flex flex-col justify-end gap-3 md:gap-4">
                  <div className="animate-fade-in opacity-0 [animation-delay:420ms] [animation-fill-mode:forwards]">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/50">
                      <Image
                        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
                        alt="Detalle de cocina"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 40vw, 22vw"
                      />
                    </div>
                  </div>
                  <div className="hidden animate-fade-in opacity-0 [animation-delay:500ms] [animation-fill-mode:forwards] sm:block">
                    <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/50">
                      <Image
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
                        alt="Arquitectura"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 40vw, 22vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/40 bg-muted/20 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Reservas directas sin comisiones de intermediarios. Mejor relación
              calidad-precio cuando coordinás con nosotros.
            </p>
            <div className="flex items-center gap-1 shrink-0 text-amber-800/90">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-current"
                  aria-hidden
                />
              ))}
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                4.9 · experiencias verificadas
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Alojamientos
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Selección reducida, bien mantenida.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-fit rounded-full border-border/80"
            >
              <Link href="/alquileres">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {formattedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-border/60 bg-card px-6 py-10 md:px-10 md:py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold md:text-2xl">
                  Reservá en directo
                </h3>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Evitá comisiones de plataformas. Consultá disponibilidad y
                  cerrá con transparencia.
                </p>
              </div>
              <Button asChild size="lg" className="h-12 shrink-0 rounded-full px-8">
                <Link href="/alquileres">Buscar fechas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/15 py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Obra reciente
              </h2>
              <p className="mt-3 max-w-lg text-lg text-muted-foreground">
                Antes y después, con foco en durabilidad y estética.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-fit rounded-full border-border/80"
            >
              <Link href="/remodelaciones">
                Ver portfolio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {formattedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Por qué Heritage
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tres principios que guían cada proyecto y cada estadía.
            </p>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {pillars.map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary md:mx-0">
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 bg-foreground py-20 text-background md:py-24">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            ¿Seguimos?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-background/75">
            Elegí una fecha o contanos tu remodelación. Respondemos con claridad
            y sin vueltas.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 rounded-full px-8 text-base"
            >
              <Link href="/alquileres">Alojamientos</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-background/30 bg-transparent px-8 text-base text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/remodelaciones#contacto">Cotizar obra</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
