import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative min-h-[calc(100svh-4.25rem)] overflow-hidden bg-[var(--bg)] pt-0">
      <div className="container relative mx-auto grid min-h-[calc(100svh-4.25rem)] items-stretch gap-10 px-4 pb-16 pt-6 md:gap-12 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-10">
        <div className="flex flex-col justify-center">
          <p
            className="animate-fade-up font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]"
            style={{ animationDelay: "0ms" }}
          >
            Alquileres · Remodelaciones · Chile
          </p>
          <h1
            className="animate-fade-up mt-4 max-w-[18ch] font-display text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.05] text-[var(--headline)]"
            style={{ animationDelay: "80ms" }}
          >
            Espacios que
            <br />
            dejan huella.
          </h1>
          <p
            className="animate-fade-up mt-4 font-display text-[clamp(1.25rem,2.5vw,1.75rem)] font-light italic leading-snug text-[var(--paragraph)]"
            style={{ animationDelay: "140ms" }}
          >
            O que transforman para siempre.
          </p>
          <p
            className="animate-fade-up mt-6 max-w-[420px] font-sans text-[15px] leading-[1.8] text-[var(--paragraph)]"
            style={{ animationDelay: "200ms" }}
          >
            Elegí tu próxima estadía o encargá una remodelación con un equipo que
            entiende diseño, materiales y plazos.
          </p>
          <div
            className="animate-fade-up mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
            style={{ animationDelay: "260ms" }}
          >
            <Link
              href="/alquileres"
              className="inline-flex w-fit items-center justify-center bg-[var(--brand-accent)] px-8 py-4 font-mono text-xs uppercase tracking-[0.1em] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-hover)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/45 active:translate-y-0"
              style={{ borderRadius: 3 }}
            >
              Ver alojamientos →
            </Link>
            <Link
              href="/remodelaciones"
              className="w-fit border-b border-[var(--brand-accent)] pb-0.5 font-mono text-xs text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/40"
            >
              Remodelaciones ↗
            </Link>
          </div>
          <p
            className="animate-fade-up mt-8 font-mono text-[10px] text-[var(--paragraph)]/60"
            style={{ animationDelay: "320ms" }}
          >
            ★★★★★ 4.9 · 120+ experiencias verificadas · Airbnb Superhost
          </p>
        </div>

        <div className="relative flex min-h-[320px] flex-1 lg:min-h-0">
          <div className="relative grid h-full min-h-[420px] w-full grid-cols-[1.65fr_1fr] grid-rows-2 gap-3 md:min-h-[480px] lg:min-h-[min(520px,55vh)]">
            <div className="relative row-span-2 overflow-hidden rounded border border-[var(--brand-border)]">
              <div className="absolute inset-y-0 right-0 z-[1] w-[2px] bg-[var(--brand-accent)]/40" />
              <Image
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85"
                alt="Interior de propiedad Heritage"
                fill
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 38vw"
                priority
              />
            </div>
            <div className="relative overflow-hidden rounded border border-[var(--brand-border)]">
              <Image
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=85"
                alt="Detalle de diseño"
                fill
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                sizes="(max-width: 1024px) 45vw, 18vw"
              />
            </div>
            <div className="relative overflow-hidden rounded border border-[var(--brand-border)]">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85"
                alt="Exterior arquitectura"
                fill
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                sizes="(max-width: 1024px) 45vw, 18vw"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[var(--paragraph)]/50 lg:block">
        <ChevronDown
          className="h-6 w-6 animate-bounce-subtle"
          strokeWidth={1.25}
          aria-hidden
        />
      </div>
    </section>
  );
}
