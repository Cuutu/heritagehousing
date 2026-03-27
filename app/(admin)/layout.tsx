"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Wrench,
  ClipboardList,
  Home,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNav = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Reservas",
    href: "/admin/reservas",
    icon: ClipboardList,
  },
  {
    name: "Calendario",
    href: "/admin/calendario",
    icon: Calendar,
  },
  {
    name: "Propiedades",
    href: "/admin/propiedades",
    icon: Building2,
  },
  {
    name: "Proyectos",
    href: "/admin/proyectos",
    icon: Wrench,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r bg-card min-h-screen flex flex-col">
          <div className="p-4 border-b">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg"
            >
              <Home className="h-5 w-5" />
              Heritage Housing
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Panel Admin</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t bg-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Admin</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <LogOut className="h-4 w-4 mr-1" />
                  Volver
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
