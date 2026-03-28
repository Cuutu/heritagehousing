"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Alquileres", href: "/alquileres" },
  { name: "Remodelaciones", href: "/remodelaciones" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] w-full transition-all duration-500 ease-out",
        scrolled
          ? "border-b border-[var(--brand-border)] bg-[rgba(245,240,232,0.88)] backdrop-blur-[12px]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="container mx-auto flex h-[4.25rem] items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-[0.95rem] font-normal uppercase tracking-[0.14em] text-[var(--headline)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/40"
        >
          Heritage Housing
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "font-sans text-xs uppercase tracking-[0.06em] transition-colors",
                pathname === item.href
                  ? "text-[var(--headline)]"
                  : "text-[var(--paragraph)] hover:text-[var(--headline)]"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/alquileres"
            className="font-sans text-xs uppercase tracking-[0.06em] text-[var(--paragraph)] transition-colors hover:text-[var(--headline)]"
          >
            Ver Propiedades
          </Link>
          <Link
            href="/alquileres"
            className="rounded-full bg-[var(--brand-accent)] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[var(--brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/50 active:translate-y-0"
          >
            Reservar Ahora
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-[var(--headline)] transition-colors hover:bg-black/[0.04] md:hidden"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" strokeWidth={1.5} />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[4.25rem] z-[99] flex flex-col bg-[var(--bg)] md:hidden">
          <div className="flex flex-1 flex-col gap-1 px-6 py-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "border-b border-[var(--brand-border)] py-4 font-sans text-lg text-[var(--paragraph)] transition-colors",
                  pathname === item.href && "text-[var(--headline)]"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/alquileres"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-accent)] py-3.5 font-mono text-xs font-medium uppercase tracking-wider text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reservar Ahora
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
