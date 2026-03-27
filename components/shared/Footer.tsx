import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const footerLinks = {
  rentals: [
    { name: "Propiedades", href: "/alquileres" },
    { name: "Cómo reservar", href: "/alquileres" },
  ],
  renovations: [
    { name: "Portfolio", href: "/remodelaciones" },
    { name: "Cotización", href: "/remodelaciones#contacto" },
  ],
  company: [
    { name: "Términos", href: "/terminos" },
    { name: "Privacidad", href: "/privacidad" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[var(--headline)] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] grain"
        aria-hidden
      />
      <div className="container relative mx-auto px-4 py-16 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="font-display text-2xl font-normal uppercase tracking-[0.2em] text-white"
            >
              Heritage
            </Link>
            <p className="mt-4 max-w-sm font-sans text-[13px] leading-relaxed text-white/50">
              Alojamientos seleccionados y remodelaciones con criterio de diseño.
              Chile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8 lg:pl-8">
            <div className="border-l border-white/[0.08] pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                Alquileres
              </p>
              <ul className="mt-4 space-y-3">
                {footerLinks.rentals.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="font-sans text-[13px] text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/50"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-l border-white/[0.08] pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                Remodelaciones
              </p>
              <ul className="mt-4 space-y-3">
                {footerLinks.renovations.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="font-sans text-[13px] text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/50"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 border-l border-white/[0.08] pl-6 sm:col-span-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                Contacto
              </p>
              <ul className="mt-4 space-y-3 font-sans text-[13px] text-white/55">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-accent)]/80" />
                  Santiago, Chile
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--brand-accent)]/80" />
                  <a
                    href="mailto:contacto@heritagehousing.cl"
                    className="transition-colors hover:text-white"
                  >
                    contacto@heritagehousing.cl
                  </a>
                </li>
              </ul>
              <ul className="mt-6 space-y-2 border-t border-white/[0.08] pt-6">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="font-sans text-xs text-white/45 transition-colors hover:text-white/80"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.08] pt-8">
          <p className="text-center font-mono text-[11px] text-white/35">
            © {new Date().getFullYear()} Heritage Housing. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
