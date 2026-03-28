import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contacto | Heritage Housing",
  description:
    "Escribinos o visitanos en Vitacura, Santiago. Respondemos consultas sobre alojamientos y remodelaciones.",
  openGraph: {
    title: "Contacto | Heritage Housing",
    description:
      "Estamos para ayudarte. Email, teléfono y formulario en Heritage Housing.",
  },
};

export default function ContactoPage() {
  return (
    <div className="bg-[var(--bg)]">
      <section className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <nav className="font-mono text-xs text-[var(--paragraph)]">
          <Link href="/" className="hover:text-[var(--headline)]">
            Inicio
          </Link>
          <span className="mx-2 text-[var(--brand-border-h)]">/</span>
          <span className="text-[var(--headline)]">Contacto</span>
        </nav>

        <h1 className="mt-6 font-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-tight text-[var(--headline)]">
          Contacto
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-[var(--paragraph)]">
          Estamos aquí para ayudarte. Escribinos cuando quieras y con gusto
          responderemos tus dudas. Tu satisfacción es nuestra prioridad.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2 className="font-display text-xl font-normal text-[var(--headline)]">
              Datos Heritage Housing
            </h2>
            <ul className="mt-6 space-y-5 font-sans text-[15px] leading-relaxed text-[var(--paragraph)]">
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
            <p className="mt-8 font-sans text-sm text-[var(--paragraph)]/85">
              También podés reservar alojamiento desde{" "}
              <Link
                href="/alquileres"
                className="font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
              >
                Alquileres
              </Link>{" "}
              o conocer{" "}
              <Link
                href="/nosotros"
                className="font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
              >
                nuestra misión
              </Link>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--brand-border)] bg-white p-6 shadow-sm md:p-8">
            <h2 className="font-display text-xl font-normal text-[var(--headline)]">
              Enviá tu mensaje
            </h2>
            <p className="mt-2 font-sans text-sm text-[var(--paragraph)]">
              Completá el formulario y te respondemos a la brevedad.
            </p>
            <ContactForm
              className="mt-8"
              messagePrefix="[Formulario página Contacto]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
