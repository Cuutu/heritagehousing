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
    <footer className="border-t border-border/80 bg-muted/30">
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight text-foreground"
            >
              Heritage Housing
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Alojamientos seleccionados y remodelaciones con criterio de diseño.
              Chile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:justify-end">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Alquileres
              </p>
              <ul className="mt-4 space-y-3">
                {footerLinks.rentals.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Remodelaciones
              </p>
              <ul className="mt-4 space-y-3">
                {footerLinks.renovations.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Contacto
              </p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  Santiago, Chile
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a
                    href="mailto:contacto@heritagehousing.cl"
                    className="transition-colors hover:text-foreground"
                  >
                    contacto@heritagehousing.cl
                  </a>
                </li>
              </ul>
              <ul className="mt-6 space-y-2 border-t border-border/60 pt-6">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-border/60 pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Heritage Housing. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
