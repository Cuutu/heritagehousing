"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Wrench,
  ClipboardList,
  Menu,
  X,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Reservas", href: "/admin/reservas", icon: ClipboardList },
  { name: "Calendario", href: "/admin/calendario", icon: Calendar },
  { name: "Propiedades", href: "/admin/propiedades", icon: Building2 },
  { name: "Proyectos", href: "/admin/proyectos", icon: Wrench },
  { name: "Blog", href: "/admin/blog", icon: BookOpen },
  { name: "Limpieza", href: "/admin/limpieza", icon: Sparkles },
];

export function AdminChrome({
  children,
  headerRight,
}: {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinkClass = (href: string) => {
    const isActive =
      pathname === href ||
      (href !== "/admin" && pathname.startsWith(`${href}/`));
    return cn(
      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--headline)]",
      isActive
        ? "bg-[var(--brand-accent)] text-white shadow-md"
        : "text-white/80 hover:bg-white/[0.08] hover:text-white"
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--brand-border)] bg-white/95 px-4 backdrop-blur-md md:px-6">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--headline)] transition-colors hover:bg-[var(--bg-surface)] md:hidden"
          aria-label="Abrir menú de administración"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-2 text-[var(--headline)]"
        >
          <span className="font-display text-lg font-normal uppercase tracking-[0.18em]">
            Heritage
          </span>
          <span className="rounded-full bg-[var(--brand-accent-soft)] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-[var(--brand-accent)]">
            Admin
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-3">{headerRight}</div>
      </header>

      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        <aside className="flex max-md:hidden w-60 shrink-0 flex-col border-r border-white/[0.08] bg-[var(--headline)] text-white lg:w-64">
          <div className="border-b border-white/[0.08] px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--brand-accent)]">
              Navegación
            </p>
            <p className="mt-1 font-sans text-xs text-white/45">
              Gestioná reservas, calendario y contenido
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(item.href)}
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-95" strokeWidth={1.75} />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/[0.08] p-3">
            <Button
              variant="secondary"
              size="sm"
              className="w-full border border-white/15 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/">← Volver al sitio público</Link>
            </Button>
          </div>
        </aside>

        {mobileOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] md:hidden"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-[60] flex w-[min(300px,88vw)] flex-col bg-[var(--headline)] text-white shadow-2xl md:hidden">
              <div className="flex h-14 items-center justify-between border-b border-white/[0.08] px-4">
                <span className="font-display text-sm uppercase tracking-[0.2em]">
                  Menú
                </span>
                <button
                  type="button"
                  className="rounded-md p-2 text-white transition-colors hover:bg-white/10"
                  aria-label="Cerrar"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                {adminNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(item.href)}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-white/[0.08] p-3">
                <Button
                  className="w-full bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent-hover)]"
                  asChild
                >
                  <Link href="/" onClick={() => setMobileOpen(false)}>
                    Volver al sitio público
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
