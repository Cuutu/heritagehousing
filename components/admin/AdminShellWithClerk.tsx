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
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Reservas", href: "/admin/reservas", icon: ClipboardList },
  { name: "Calendario", href: "/admin/calendario", icon: Calendar },
  { name: "Propiedades", href: "/admin/propiedades", icon: Building2 },
  { name: "Proyectos", href: "/admin/proyectos", icon: Wrench },
];

export function AdminShellWithClerk({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <header className="border-b border-stone-200 bg-white sticky top-0 z-40">
        <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-stone-900"
          >
            <Home className="h-5 w-5 text-amber-800" />
            Heritage Housing
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm text-stone-600 truncate hidden sm:inline max-w-[200px]">
              {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? ""}
            </span>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-56 md:w-64 border-r border-stone-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-100">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Panel Admin
            </p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-amber-900 text-white"
                      : "text-stone-700 hover:bg-stone-100"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-stone-100">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/">Volver al sitio</Link>
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
