import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros | Heritage Housing",
  description:
    "Misión, valores y trayectoria de Heritage Housing: alojamientos y experiencias en Chile con respeto por el patrimonio y el diseño.",
  openGraph: {
    title: "Nosotros | Heritage Housing",
    description:
      "Revitalizamos el legado arquitectónico y ofrecemos estadías auténticas en Chile.",
  },
};

const stats = [
  {
    value: "2+",
    label: "Años",
    hint: "Impulsando el proyecto desde 2022",
  },
  {
    value: "300+",
    label: "Reseñas positivas",
    hint: "Confianza de huéspedes y clientes",
  },
  {
    value: "1K+",
    label: "Experiencias",
    hint: "Personas que eligieron hospedarse con nosotros",
  },
  {
    value: "900+",
    label: "Reservas",
    hint: "Gestionadas a través de nuestros canales",
  },
];

export default function NosotrosPage() {
  return (
    <div className="bg-[var(--bg)]">
      <section className="container mx-auto max-w-3xl px-4 py-14 md:py-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-accent)]">
          Heritage Housing
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight text-[var(--headline)]">
          Misión
        </h1>
        <div className="mt-8 space-y-6 font-sans text-[15px] leading-[1.85] text-[var(--paragraph)]">
          <p>
            Nuestra misión es revitalizar y preservar el legado arquitectónico
            de zonas con historia, ofreciendo a nuestros huéspedes experiencias
            únicas y auténticas en cada propiedad. Combinamos historia y
            confort para tender un puente entre el pasado y el presente:
            hospedajes que cuentan historias y generan recuerdos inolvidables.
          </p>
          <p className="font-display text-lg italic text-[var(--headline)]/90">
            — Marcelo Calvillan
          </p>
        </div>
      </section>

      <section className="border-y border-[var(--brand-border)] bg-[var(--bg-surface)] py-14 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-display text-2xl font-light text-[var(--headline)] md:text-3xl">
            Datos Heritage Housing
          </h2>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[var(--brand-border)] bg-[var(--bg)] p-6 text-center shadow-sm"
              >
                <p className="font-display text-4xl font-light tabular-nums text-[var(--brand-accent)] md:text-5xl">
                  {s.value}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--paragraph)]">
                  {s.label}
                </p>
                <p className="mt-3 font-sans text-xs leading-relaxed text-[var(--paragraph)]/85">
                  {s.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-14 md:py-20">
        <h2 className="font-display text-2xl font-light text-[var(--headline)] md:text-3xl">
          Contacto
        </h2>
        <p className="mt-4 font-sans text-[15px] leading-relaxed text-[var(--paragraph)]">
          Estamos en Vitacura, Santiago. Escribinos o llamanos cuando quieras.
        </p>
        <ul className="mt-8 space-y-4 font-sans text-[15px] text-[var(--paragraph)]">
          <li className="flex gap-3">
            <MapPin
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-accent)]"
              strokeWidth={1.5}
            />
            <span>
              Av. Kennedy #7440, oficina 701, Vitacura, Santiago, Chile
            </span>
          </li>
          <li className="flex gap-3">
            <Phone
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-accent)]"
              strokeWidth={1.5}
            />
            <a
              href="tel:+56966161202"
              className="font-medium text-[var(--headline)] underline-offset-4 hover:underline"
            >
              (+56) 9 6616 1202
            </a>
          </li>
          <li className="flex gap-3">
            <Mail
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-accent)]"
              strokeWidth={1.5}
            />
            <a
              href="mailto:contacto@heritagehousing.cl"
              className="font-medium text-[var(--headline)] underline-offset-4 hover:underline"
            >
              contacto@heritagehousing.cl
            </a>
          </li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-8 py-3 font-mono text-xs uppercase tracking-wide text-white transition-colors hover:bg-[var(--brand-accent-hover)]"
          >
            Formulario de contacto
          </Link>
          <Link
            href="/alquileres"
            className="inline-flex items-center justify-center rounded-full border border-[var(--brand-accent)] px-8 py-3 font-mono text-xs uppercase tracking-wide text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent-soft)]"
          >
            Ver alojamientos
          </Link>
        </div>
      </section>
    </div>
  );
}
