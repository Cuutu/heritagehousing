"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Alquileres", href: "/alquileres" },
  { name: "Remodelaciones", href: "/remodelaciones" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-[4.25rem] items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          Heritage Housing
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/alquileres">Explorar</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href="/alquileres">Reservar</Link>
          </Button>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-foreground md:hidden"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base font-medium",
                  pathname === item.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3">
              <Button asChild className="w-full rounded-full">
                <Link href="/alquileres" onClick={() => setMobileMenuOpen(false)}>
                  Reservar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
