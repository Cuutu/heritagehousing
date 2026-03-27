export const dynamic = "force-dynamic";

import Link from "next/link";
import { Star, Building2, Globe2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HomeHero } from "@/components/home/HomeHero";
import { RevealOnScroll } from "@/components/home/RevealOnScroll";
import { LandingPropertyCard } from "@/components/home/LandingPropertyCard";
import { RenovationShowcaseCard } from "@/components/home/RenovationShowcaseCard";

const whyFeatures = [
  {
    n: "01",
    title: "Reserva segura",
    body: "Pagos con estándares actuales y comunicación clara en cada paso.",
  },
  {
    n: "02",
    title: "Atención personalizada",
    body: "Hablás con quien gestiona la propiedad o el proyecto, sin intermediarios innecesarios.",
  },
  {
    n: "03",
    title: "Propiedades verificadas",
    body: "Curaduría real: limpieza, mantenimiento y detalles que se notan al llegar.",
  },
  {
    n: "04",
    title: "Sin sorpresas",
    body: "Precios y condiciones transparentes. Lo que ves es lo que reservás.",
  },
];

export default async function HomePage() {
  const [properties, projects, propertyCount] = await Promise.all([
    prisma.property.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { isActive: true },
      take: 2,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where: { isActive: true } }),
  ]);

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

  const p0 = formattedProperties[0];
  const p1 = formattedProperties[1];
  const p2 = formattedProperties[2];

  return (
    <div className="flex flex-col bg-[var(--bg)]">
      <HomeHero />

      {/* Trust bar */}
      <RevealOnScroll>
        <section className="border-y border-[var(--brand-border)] bg-[var(--bg-surface)] py-6 md:py-7">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col flex-wrap items-center justify-center gap-y-3 text-center sm:flex-row sm:gap-x-6 md:gap-x-10 lg:gap-x-12">
              <span className="inline-flex items-center gap-2 font-sans text-xs text-[var(--paragraph)]">
                <Building2
                  className="h-4 w-4 text-[var(--brand-accent)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                Airbnb Superhost
              </span>
              <span className="hidden font-mono text-[var(--brand-accent)] sm:inline">
                ·
              </span>
              <span className="inline-flex items-center gap-2 font-sans text-xs text-[var(--paragraph)]">
                <Globe2
                  className="h-4 w-4 text-[var(--brand-accent)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                Booking.com Partner
              </span>
              <span className="hidden font-mono text-[var(--brand-accent)] sm:inline">
                ·
              </span>
              <span className="inline-flex items-center gap-2 font-sans text-xs text-[var(--paragraph)]">
                <Star
                  className="h-4 w-4 fill-[var(--brand-accent)] text-[var(--brand-accent)]"
                  aria-hidden
                />
                4.9 · Google Reviews
              </span>
              <span className="hidden font-mono text-[var(--brand-accent)] sm:inline">
                ·
              </span>
              <span className="font-sans text-xs text-[var(--paragraph)]">
                120+ Huéspedes satisfechos
              </span>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* Featured properties */}
      {p0 && (
        <section className="px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-[120px]">
          <div className="container mx-auto max-w-[1280px]">
            <RevealOnScroll>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                    Selección curada
                  </p>
                  <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-light text-[var(--headline)]">
                    Nuestras Propiedades
                  </h2>
                </div>
                <Link
                  href="/alquileres"
                  className="font-mono text-[11px] uppercase tracking-wide text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)]"
                >
                  Ver todas →
                </Link>
              </div>
            </RevealOnScroll>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:grid-rows-2 lg:items-stretch">
              <RevealOnScroll delayMs={0} className="h-full lg:row-span-2">
                <LandingPropertyCard
                  property={p0}
                  variant="large"
                  featured
                  className="h-full"
                />
              </RevealOnScroll>
              {p1 && (
                <RevealOnScroll delayMs={80} className="h-full">
                  <LandingPropertyCard
                    property={p1}
                    variant="small"
                    className="h-full"
                  />
                </RevealOnScroll>
              )}
              {p2 && (
                <RevealOnScroll delayMs={160} className="h-full">
                  <LandingPropertyCard
                    property={p2}
                    variant="small"
                    className="h-full"
                  />
                </RevealOnScroll>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Direct booking banner */}
      <RevealOnScroll>
        <section className="relative overflow-hidden bg-[var(--brand-accent)] px-4 py-16 md:px-10 md:py-20 lg:px-16">
          <div className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/[0.06] blur-2xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/[0.05] blur-2xl" />
          <div className="container relative mx-auto flex max-w-[1200px] flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold italic leading-tight text-white">
                Reservá directo.
              </h2>
              <p className="mt-3 font-display text-[clamp(1.5rem,3vw,2rem)] font-light text-white/85">
                Sin comisiones. Mejor precio garantizado.
              </p>
              <p className="mt-4 font-sans text-sm text-white/65">
                Ahorrate hasta un 15% vs Airbnb y Booking.com
              </p>
            </div>
            <Link
              href="/alquileres"
              className="inline-flex w-full shrink-0 items-center justify-center bg-white px-10 py-[18px] font-mono text-[13px] font-medium uppercase tracking-wide text-[var(--brand-accent)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:w-auto"
              style={{ borderRadius: 3 }}
            >
              Buscar disponibilidad →
            </Link>
          </div>
        </section>
      </RevealOnScroll>

      {/* Renovations */}
      {formattedProjects.length > 0 && (
        <section className="bg-[var(--bg)] px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-[120px]">
          <div className="container mx-auto max-w-[1280px]">
            <RevealOnScroll>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                    Nuestro trabajo
                  </p>
                  <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-light text-[var(--headline)]">
                    Transformamos espacios.
                  </h2>
                </div>
                <Link
                  href="/remodelaciones"
                  className="font-mono text-[11px] uppercase tracking-wide text-[var(--brand-accent)]"
                >
                  Ver portfolio →
                </Link>
              </div>
            </RevealOnScroll>
            <div className="mt-12 grid gap-[3px] md:grid-cols-2">
              {formattedProjects.map((project, i) => (
                <RevealOnScroll key={project.id} delayMs={i * 100}>
                  <RenovationShowcaseCard project={project} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <RevealOnScroll>
        <section className="bg-[var(--bg-surface)] px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-[120px]">
          <div className="container mx-auto max-w-[1280px]">
            <div className="grid gap-14 lg:grid-cols-[2fr_3fr] lg:gap-16">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                  Por qué Heritage
                </p>
                <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.15] text-[var(--headline)]">
                  Calidad, confianza
                  <br />y atención.
                </h2>
                <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-[var(--paragraph)]">
                  Un equipo chileno que combina gestión impecable con sensibilidad
                  por el detalle — en cada estadía y en cada obra.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-8 sm:gap-10">
                  <div>
                    <p className="font-display text-[clamp(2.5rem,5vw,3.25rem)] font-light text-[var(--brand-accent)]">
                      120+
                    </p>
                    <p className="mt-1 font-sans text-xs text-[var(--paragraph)]">
                      Reseñas
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-[clamp(2.5rem,5vw,3.25rem)] font-light text-[var(--brand-accent)]">
                      4.9★
                    </p>
                    <p className="mt-1 font-sans text-xs text-[var(--paragraph)]">
                      Google
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-[clamp(2.5rem,5vw,3.25rem)] font-light text-[var(--brand-accent)]">
                      3+
                    </p>
                    <p className="mt-1 font-sans text-xs text-[var(--paragraph)]">
                      Años
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-[clamp(2.5rem,5vw,3.25rem)] font-light text-[var(--brand-accent)]">
                      {propertyCount || "—"}
                    </p>
                    <p className="mt-1 font-sans text-xs text-[var(--paragraph)]">
                      Propiedades
                    </p>
                  </div>
                </div>
              </div>
              <ul className="space-y-0 divide-y divide-[var(--brand-border)]">
                {whyFeatures.map((item) => (
                  <li
                    key={item.n}
                    className="group py-7 transition-transform duration-300 first:pt-0 hover:translate-x-2"
                  >
                    <p className="font-mono text-[11px] text-[var(--brand-accent)]/50">
                      {item.n}
                    </p>
                    <h3 className="mt-2 font-display text-[22px] font-normal text-[var(--headline)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-sans text-[13px] leading-relaxed text-[var(--paragraph)]">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* Final CTA */}
      <RevealOnScroll>
        <section
          className="relative px-4 py-16 text-center md:px-6 md:py-24 lg:px-8 lg:py-[120px]"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--brand-accent-soft) 0%, transparent 65%), var(--bg)",
          }}
        >
          <div className="container relative mx-auto max-w-[900px]">
            <h2 className="font-display text-[clamp(2.25rem,5vw,3.6rem)] font-light italic leading-tight text-[var(--headline)]">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="mx-auto mt-5 max-w-lg font-sans text-[15px] text-[var(--paragraph)]">
              Elegí fechas o contanos tu remodelación. Respondemos con claridad y
              sin vueltas.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Link
                href="/alquileres"
                className="inline-flex min-w-[200px] items-center justify-center bg-[var(--brand-accent)] px-8 py-3.5 font-mono text-xs uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/45"
                style={{ borderRadius: 3 }}
              >
                Buscar alojamiento
              </Link>
              <Link
                href="/remodelaciones#contacto"
                className="inline-flex min-w-[200px] items-center justify-center border border-[var(--brand-accent)] px-8 py-3.5 font-mono text-xs uppercase tracking-wide text-[var(--brand-accent)] transition-all hover:bg-[var(--brand-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/40"
                style={{ borderRadius: 3 }}
              >
                Solicitar cotización
              </Link>
            </div>
          </div>
        </section>
      </RevealOnScroll>
    </div>
  );
}
