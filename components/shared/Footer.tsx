import Link from "next/link";
import { Home, Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

const footerLinks = {
  rentals: [
    { name: "Ver Propiedades", href: "/alquileres" },
    { name: "Cómo Reservar", href: "/ayuda" },
    { name: "Preguntas Frecuentes", href: "/faq" },
  ],
  renovations: [
    { name: "Portfolio", href: "/remodelaciones" },
    { name: "Solicitar Cotización", href: "/remodelaciones#contacto" },
    { name: "Proceso de Trabajo", href: "/proceso" },
  ],
  company: [
    { name: "Sobre Nosotros", href: "/nosotros" },
    { name: "Términos y Condiciones", href: "/terminos" },
    { name: "Política de Privacidad", href: "/privacidad" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Heritage Housing</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Tu socio de confianza para arriendos vacacionales y remodelaciones
              en Chile. Calidad, confianza y atención personalizada.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Alquileres</h3>
            <ul className="space-y-2">
              {footerLinks.rentals.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Remodelaciones</h3>
            <ul className="space-y-2">
              {footerLinks.renovations.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Santiago, Chile
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:+56912345678" className="hover:text-foreground">
                  +56 9 1234 5678
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:contacto@heritagehousing.cl"
                  className="hover:text-foreground"
                >
                  contacto@heritagehousing.cl
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Heritage Housing. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
